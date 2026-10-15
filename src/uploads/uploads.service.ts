import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from './s3.service';

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  /**
   * Upload one or more files to S3 and return their URLs.
   * Falls back to local storage path if S3 is not configured.
   */
  async uploadFiles(files: UploadFile[], folder?: string): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
      if (this.s3.isEnabled()) {
        const result = await this.s3.upload(file.buffer, file.originalname, {
          folder,
          contentType: file.mimetype,
        });
        urls.push(result.url);
      } else {
        this.logger.warn('S3 not configured – using placeholder URL');
        const key = `${folder || 'uploads'}/${file.originalname}`;
        urls.push(`/${key}`);
      }
    }

    return urls;
  }

  async attachPhotos(propertyId: string, urls: string[]) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: { orderBy: { sortOrder: 'desc' }, take: 1 } },
    });
    if (!property) throw new NotFoundException('Property not found');

    const lastSortOrder = property.images[0]?.sortOrder ?? -1;

    return this.prisma.propertyImage.createMany({
      data: urls.map((url, idx) => ({
        propertyId,
        url,
        sortOrder: lastSortOrder + 1 + idx,
      })),
    });
  }

  async deletePhoto(url: string) {
    if (this.s3.isEnabled()) {
      await this.s3
        .deleteOne(url)
        .catch((err) =>
          this.logger.error(
            `Failed to delete S3 object: ${
              err instanceof Error ? err.message : String(err)
            }`,
          ),
        );
    }
    return { deleted: url };
  }

  // ── Sub-entity image management (Stay / Experience / Transport) ─────────────

  async getStayImages(stayId: string) {
    return this.prisma.stayImage.findMany({
      where: { stayId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addStayImages(stayId: string, files: UploadFile[]) {
    const urls = await this.uploadFiles(files, `stays/${stayId}`);
    const lastSort =
      (
        await this.prisma.stayImage.findFirst({
          where: { stayId },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true },
        })
      )?.sortOrder ?? -1;

    await this.prisma.stayImage.createMany({
      data: urls.map((url, i) => ({
        stayId,
        url,
        sortOrder: lastSort + 1 + i,
      })),
    });

    return this.getStayImages(stayId);
  }

  async deleteStayImage(stayId: string, url: string) {
    if (this.s3.isEnabled()) {
      await this.s3
        .deleteOne(url)
        .catch((err) =>
          this.logger.error(
            `Failed to delete S3 object: ${
              err instanceof Error ? err.message : String(err)
            }`,
          ),
        );
    }
    await this.prisma.stayImage.deleteMany({
      where: { stayId, url },
    });
    return this.getStayImages(stayId);
  }

  async getExperienceImages(experienceId: string) {
    return this.prisma.experienceImage.findMany({
      where: { experienceId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addExperienceImages(experienceId: string, files: UploadFile[]) {
    const urls = await this.uploadFiles(files, `experiences/${experienceId}`);
    const lastSort =
      (
        await this.prisma.experienceImage.findFirst({
          where: { experienceId },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true },
        })
      )?.sortOrder ?? -1;

    await this.prisma.experienceImage.createMany({
      data: urls.map((url, i) => ({
        experienceId,
        url,
        sortOrder: lastSort + 1 + i,
      })),
    });

    return this.getExperienceImages(experienceId);
  }

  async deleteExperienceImage(experienceId: string, url: string) {
    if (this.s3.isEnabled()) {
      await this.s3
        .deleteOne(url)
        .catch((err) =>
          this.logger.error(
            `Failed to delete S3 object: ${
              err instanceof Error ? err.message : String(err)
            }`,
          ),
        );
    }
    await this.prisma.experienceImage.deleteMany({
      where: { experienceId, url },
    });
    return this.getExperienceImages(experienceId);
  }

  async getTransportImages(transportId: string) {
    return this.prisma.transportImage.findMany({
      where: { transportId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addTransportImages(transportId: string, files: UploadFile[]) {
    const urls = await this.uploadFiles(files, `transports/${transportId}`);
    const lastSort =
      (
        await this.prisma.transportImage.findFirst({
          where: { transportId },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true },
        })
      )?.sortOrder ?? -1;

    await this.prisma.transportImage.createMany({
      data: urls.map((url, i) => ({
        transportId,
        url,
        sortOrder: lastSort + 1 + i,
      })),
    });

    return this.getTransportImages(transportId);
  }

  async deleteTransportImage(transportId: string, url: string) {
    if (this.s3.isEnabled()) {
      await this.s3
        .deleteOne(url)
        .catch((err) =>
          this.logger.error(
            `Failed to delete S3 object: ${
              err instanceof Error ? err.message : String(err)
            }`,
          ),
        );
    }
    await this.prisma.transportImage.deleteMany({
      where: { transportId, url },
    });
    return this.getTransportImages(transportId);
  }
}
