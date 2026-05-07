import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { S3Service } from './s3.service';
import * as multerS3 from 'multer-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const multerS3Storage = (multerS3 as any).default ?? multerS3;

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const s3 = new S3Client({
          region: config.getOrThrow('AWS_REGION'),
          credentials: {
            accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
            secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
          },
        });
        return {
          storage: multerS3Storage({
            s3,
            bucket: config.getOrThrow('AWS_S3_BUCKET'),
            contentType: multerS3Storage.AUTO_CONTENT_TYPE,
            key: (_req, file, cb) =>
              cb(null, `photos/${randomUUID()}${extname(file.originalname)}`),
          }),
          fileFilter: (_req, file, cb) => {
            if (!file.mimetype.match(/image\/(jpeg|png|webp)/)) {
              return cb(new Error('Only jpeg, png, webp images are allowed'), false);
            }
            cb(null, true);
          },
          limits: { fileSize: 8 * 1024 * 1024 },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [UploadsService, S3Service],
  controllers: [UploadsController],
  exports: [S3Service],
})
export class UploadsModule {}
