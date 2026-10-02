import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  async deleteMany(urls: string[]) {
    // AWS S3 disabled
    return Promise.resolve();
  }

  async deleteOne(url: string) {
    // AWS S3 disabled
    return Promise.resolve();
  }
}
