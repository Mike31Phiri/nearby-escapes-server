import {
  Controller, Delete, Param, Post, Query, Req,
  UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import * as multerS3 from 'multer-s3';
import type { Request } from 'express';

@ApiTags('Uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(
    @Req() req: Request,
    @UploadedFiles() files: Express.MulterS3.File[],
    @Query('resourceType') resourceType: 'accommodation' | 'bus' | 'attraction' | 'package',
    @Query('resourceId') resourceId: string,
  ) {
    const urls = files.map((f) => (f as any).location ?? `/uploads/${(f as any).filename}`);
    await this.uploadsService.attachPhotos(resourceType, resourceId, urls);
    return { uploaded: urls };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':key')
  deletePhoto(@Param('key') key: string) {
    return this.uploadsService.deletePhoto(decodeURIComponent(key));
  }
}
