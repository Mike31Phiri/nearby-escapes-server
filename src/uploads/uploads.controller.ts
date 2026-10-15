import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SecurityLevelGuard } from '../auth/guards/security-level.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SecurityLevel } from '../auth/decorators/security-level.decorator';
import { MalwareScannerService } from './malware-scanner.service';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function validateFileTypes(
  allowed: string[],
): (
  req: any,
  file: Express.Multer.File,
  cb: (error: any, acceptFile: boolean) => void,
) => void {
  return (
    req: any,
    file: Express.Multer.File,
    cb: (error: any, acceptFile: boolean) => void,
  ) => {
    const allowedExtended = allowed.includes('image/*')
      ? [...allowed.filter((a) => a !== 'image/*'), ...IMAGE_MIMES]
      : allowed;
    if (allowedExtended.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(`Unsupported file type: ${file.mimetype}`),
        false,
      );
    }
  };
}

@ApiTags('Uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
export class UploadsController {
  constructor(
    private uploadsService: UploadsService,
    private malwareScanner: MalwareScannerService,
    private s3: S3Service,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard, SecurityLevelGuard)
  @SecurityLevel('INTERNAL')
  @Roles('HOST', 'ADMIN', 'GUEST')
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: validateFileTypes([
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload one or more files to S3 and return URLs' })
  async upload(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('propertyId') propertyId?: string,
    @Query('listingId') listingId?: string,
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      return { error: 'No files provided' };
    }

    for (const file of files) {
      let buffer = file.buffer;
      if (!buffer) {
        const fs = await import('fs');
        if (file.path && fs.existsSync(file.path)) {
          buffer = fs.readFileSync(file.path);
        }
      }
      if (buffer) {
        this.malwareScanner.validateBuffer(
          buffer,
          file.mimetype,
          file.originalname,
        );
      }
    }

    const uploadFiles = files.map((f) => ({
      buffer: f.buffer,
      originalname: f.originalname,
      mimetype: f.mimetype,
    }));

    const urls = await this.uploadsService.uploadFiles(
      uploadFiles,
      folder || 'listings',
    );

    const targetId = propertyId || listingId;
    if (targetId) {
      await this.uploadsService.attachPhotos(targetId, urls);
    }

    return {
      uploaded: urls.map((url, i) => ({
        url,
        originalName: files[i]?.originalname,
      })),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST', 'GUEST')
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: validateFileTypes(['image/jpeg', 'image/png', 'image/gif']),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single avatar image' })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file provided' };
    }

    let buffer = file.buffer;
    if (!buffer) {
      const fs = await import('fs');
      if (file.path && fs.existsSync(file.path)) {
        buffer = fs.readFileSync(file.path);
      }
    }
    if (buffer) {
      this.malwareScanner.validateBuffer(
        buffer,
        file.mimetype,
        file.originalname,
      );
    }

    const result = await this.s3.upload(buffer, file.originalname, {
      folder: 'avatars',
      contentType: file.mimetype,
    });

    return { url: result.url, key: result.key };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('stay/:stayId/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: validateFileTypes(['image/jpeg', 'image/png', 'image/webp']),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images to a stay unit' })
  async uploadStayImages(
    @Param('stayId') stayId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadFiles = files.map((f) => ({
      buffer: f.buffer,
      originalname: f.originalname,
      mimetype: f.mimetype,
    }));
    const images = await this.uploadsService.addStayImages(stayId, uploadFiles);
    return { stayId, images };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('experience/:experienceId/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: validateFileTypes(['image/jpeg', 'image/png', 'image/webp']),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images to an experience unit' })
  async uploadExperienceImages(
    @Param('experienceId') experienceId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadFiles = files.map((f) => ({
      buffer: f.buffer,
      originalname: f.originalname,
      mimetype: f.mimetype,
    }));
    const images = await this.uploadsService.addExperienceImages(
      experienceId,
      uploadFiles,
    );
    return { experienceId, images };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('transport/:transportId/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: validateFileTypes(['image/jpeg', 'image/png', 'image/webp']),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images to a transport unit' })
  async uploadTransportImages(
    @Param('transportId') transportId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadFiles = files.map((f) => ({
      buffer: f.buffer,
      originalname: f.originalname,
      mimetype: f.mimetype,
    }));
    const images = await this.uploadsService.addTransportImages(
      transportId,
      uploadFiles,
    );
    return { transportId, images };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('stay/:stayId/images')
  @ApiOperation({ summary: 'Delete an image from a stay unit' })
  async deleteStayImage(
    @Param('stayId') stayId: string,
    @Query('url') url: string,
  ) {
    return this.uploadsService.deleteStayImage(stayId, decodeURIComponent(url));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('experience/:experienceId/images')
  @ApiOperation({ summary: 'Delete an image from an experience unit' })
  async deleteExperienceImage(
    @Param('experienceId') experienceId: string,
    @Query('url') url: string,
  ) {
    return this.uploadsService.deleteExperienceImage(
      experienceId,
      decodeURIComponent(url),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('transport/:transportId/images')
  @ApiOperation({ summary: 'Delete an image from a transport unit' })
  async deleteTransportImage(
    @Param('transportId') transportId: string,
    @Query('url') url: string,
  ) {
    return this.uploadsService.deleteTransportImage(
      transportId,
      decodeURIComponent(url),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST', 'ADMIN')
  @Delete(':key')
  @ApiOperation({ summary: 'Delete an uploaded photo' })
  deletePhoto(@Param('key') key: string) {
    return this.uploadsService.deletePhoto(decodeURIComponent(key));
  }
}
