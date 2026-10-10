import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { S3Service } from './s3.service';
import { MalwareScannerService } from './malware-scanner.service';

@Module({
  providers: [UploadsService, S3Service, MalwareScannerService],
  controllers: [UploadsController],
  exports: [UploadsService, S3Service, MalwareScannerService],
})
export class UploadsModule {}
