import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { S3Service } from './s3.service';

@Module({
  providers: [UploadsService, S3Service],
  controllers: [UploadsController],
  exports: [UploadsService, S3Service],
})
export class UploadsModule {}
