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

  async attachPhotos(listingId: string, urls: string[]) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    return this.prisma.listing.update({
      where: { id: listingId },
      data: { images: { push: urls } },
    });
  }

  async deletePhoto(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    return { deleted: key };
  }
}
