import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

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

  async deletePhoto(key: string) {
    // AWS S3 disabled
    return { deleted: key };
  }
}
