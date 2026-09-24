import {
  Controller, Delete, Param, Post, Query, Req,
  UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
    @Query('propertyId') propertyId?: string,
    @Query('listingId') listingId?: string,
  ) {
    const targetId = propertyId || listingId;
    const urls = files.map((f) => (f as any).location ?? `/uploads/${(f as any).filename}`);
    const keys = files.map((f) => (f as any).key ?? (f as any).filename);
    if (targetId) {
      await this.uploadsService.attachPhotos(targetId, urls);
    }
    return { key: keys[0], url: urls[0], uploaded: urls.map((url, i) => ({ key: keys[i], url })) };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':key')
  deletePhoto(@Param('key') key: string) {
    return this.uploadsService.deletePhoto(decodeURIComponent(key));
  }
}
