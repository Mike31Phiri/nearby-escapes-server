import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
  etag?: string;
}

export interface S3UploadOptions {
  folder?: string;
  contentType?: string;
  customKey?: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly forcePathStyle: boolean;
  private readonly cdnUrl?: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get<string>('S3_BUCKET') || '';
    this.region = config.get<string>('S3_REGION') || 'us-east-1';
    this.endpoint = config.get<string>('S3_ENDPOINT') || undefined;
    this.forcePathStyle = config.get<string>('S3_FORCE_PATH_STYLE') === 'true';
    this.cdnUrl = config.get<string>('S3_CDN_URL') || '';

    const accessKeyId = config.get<string>('S3_ACCESS_KEY_ID') || '';
    const secretAccessKey = config.get<string>('S3_SECRET_ACCESS_KEY') || '';

    this.s3 = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: this.forcePathStyle,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  isEnabled(): boolean {
    return (
      !!this.bucket &&
      !!this.config.get<string>('S3_ACCESS_KEY_ID') &&
      !!this.config.get<string>('S3_SECRET_ACCESS_KEY')
    );
  }

  private buildKey(
    folder: string | undefined,
    originalName: string,
    customKey?: string,
  ): string {
    if (customKey) return customKey;
    const ext = path.extname(originalName) || '.jpg';
    const prefix = folder ? `${folder}/` : '';
    return `${prefix}${crypto.randomUUID()}${ext}`;
  }

  private buildUrl(key: string): string {
    if (this.cdnUrl) return `${this.cdnUrl}/${key}`;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    options: S3UploadOptions = {},
  ): Promise<S3UploadResult> {
    const key = this.buildKey(options.folder, originalName, options.customKey);

    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.contentType || 'application/octet-stream',
      ServerSideEncryption: 'AES256',
      Metadata: {
        originalName: originalName,
      },
    };

    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(input),
      );

      const url = this.buildUrl(key);

      this.logger.log(`S3 upload: ${key} → ${url}`);

      return {
        url,
        key,
        bucket: this.bucket,
        etag: response.ETag,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`S3 upload failed for ${key}: ${message}`, stack);
      throw new InternalServerErrorException(
        `Failed to upload file to S3: ${message}`,
      );
    }
  }

  async uploadMultiple(
    files: Array<{
      buffer: Buffer;
      originalname: string;
      mimetype?: string;
    }>,
    options: S3UploadOptions = {},
  ): Promise<S3UploadResult[]> {
    const results: S3UploadResult[] = [];
    for (const file of files) {
      const result = await this.upload(file.buffer, file.originalname, {
        ...options,
        contentType: file.mimetype || options.contentType,
      });
      results.push(result);
    }
    return results;
  }

  async deleteOne(keyOrUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(keyOrUrl);
    if (!key) {
      this.logger.warn(`S3 delete: could not extract key from ${keyOrUrl}`);
      return;
    }

    const input: DeleteObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
    };

    try {
      await this.s3.send(new DeleteObjectCommand(input));
      this.logger.log(`S3 delete: ${key}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`S3 delete failed for ${key}: ${message}`, stack);
      throw new InternalServerErrorException(
        `Failed to delete file from S3: ${message}`,
      );
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    const validKeys = keys
      .map((k) => this.extractKeyFromUrl(k))
      .filter((k): k is string => !!k);

    if (validKeys.length === 0) {
      this.logger.warn('S3 deleteMany: no valid keys provided');
      return;
    }

    const chunks: string[][] = [];
    for (let i = 0; i < validKeys.length; i += 1000) {
      chunks.push(validKeys.slice(i, i + 1000));
    }

    for (const chunk of chunks) {
      const objects = chunk.map((key) => ({ Key: key }));
      try {
        await this.s3.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: { Objects: objects, Quiet: true },
          }),
        );
        this.logger.log(`S3 deleteMany: deleted ${chunk.length} objects`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        this.logger.error(`S3 deleteMany failed: ${message}`, stack);
      }
    }
  }

  private extractKeyFromUrl(keyOrUrl: string): string | null {
    if (keyOrUrl.startsWith('http')) {
      try {
        const url = new URL(keyOrUrl);
        const parts = url.pathname.split('/');
        return parts.slice(1).join('/');
      } catch {
        return null;
      }
    }
    return keyOrUrl;
  }

  async checkBucketAccess(): Promise<boolean> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`S3 bucket access check failed: ${message}`);
      return false;
    }
  }

  buildPublicUrl(key: string): string {
    return this.buildUrl(key);
  }
}
