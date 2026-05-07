import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  public s3: S3Client;
  public bucket: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: config.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = config.getOrThrow('AWS_S3_BUCKET');
  }

  async attachPhotos(
    resourceType: 'accommodation' | 'bus' | 'attraction' | 'package',
    resourceId: string,
    urls: string[],
  ) {
    const data = { photos: { push: urls } };
    switch (resourceType) {
      case 'accommodation':
        return this.prisma.accommodation.update({ where: { id: resourceId }, data });
      case 'bus':
        return this.prisma.bus.update({ where: { id: resourceId }, data });
      case 'attraction':
        return this.prisma.attraction.update({ where: { id: resourceId }, data });
      case 'package':
        return this.prisma.package.update({ where: { id: resourceId }, data });
    }
  }

  async deletePhoto(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    return { deleted: key };
  }
}
