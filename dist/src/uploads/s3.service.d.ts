import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private config;
    private s3;
    private bucket;
    private readonly logger;
    constructor(config: ConfigService);
    deleteMany(urls: string[]): Promise<void>;
    deleteOne(url: string): Promise<void>;
    private extractKey;
}
