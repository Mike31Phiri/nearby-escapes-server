import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: config.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = config.getOrThrow('AWS_S3_BUCKET');
  }

  async deleteMany(urls: string[]) {
    if (!urls.length) return;
    const keys = urls.map((url) => ({ Key: this.extractKey(url) }));
    try {
      await this.s3.send(new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys },
      }));
    } catch (err) {
      this.logger.error(`Failed to delete S3 objects: ${err.message}`);
    }
  }

  async deleteOne(url: string) {
    try {
      await this.s3.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: this.extractKey(url),
      }));
    } catch (err) {
      this.logger.error(`Failed to delete S3 object: ${err.message}`);
    }
  }

  private extractKey(url: string): string {
    // Handles both full S3 URLs and key-only strings
    try {
      return new URL(url).pathname.slice(1);
    } catch {
      return url;
    }
  }
}
