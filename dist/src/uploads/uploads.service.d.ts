import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
export declare class UploadsService {
    private prisma;
    private config;
    s3: S3Client;
    bucket: string;
    constructor(prisma: PrismaService, config: ConfigService);
    attachPhotos(propertyId: string, urls: string[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deletePhoto(key: string): Promise<{
        deleted: string;
    }>;
}
