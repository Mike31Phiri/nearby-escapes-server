import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.collection.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, dto: CreateCollectionDto) {
    const slug = this.toSlug(dto.name);
    return this.prisma.collection.create({
      data: {
        userId,
        name: dto.name,
        stayIds: dto.stayIds ?? [],
        isShared: dto.isShared ?? false,
        slug,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    await this.assertOwnership(id, userId);
    const data: any = { ...dto };
    if (dto.name) data.slug = this.toSlug(dto.name);
    return this.prisma.collection.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    await this.assertOwnership(id, userId);
    return this.prisma.collection.delete({ where: { id } });
  }

  async findBySlug(slug: string) {
    const collection = await this.prisma.collection.findUnique({ where: { slug } });
    if (!collection || !collection.isShared) throw new NotFoundException('Collection not found');
    return collection;
  }

  private toSlug(name: string): string {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }

  private async assertOwnership(id: string, userId: string) {
    const col = await this.prisma.collection.findUnique({ where: { id } });
    if (!col) throw new NotFoundException('Collection not found');
    if (col.userId !== userId) throw new ForbiddenException();
    return col;
  }
}
