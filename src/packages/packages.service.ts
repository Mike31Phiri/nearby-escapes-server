import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  async create(hostId: string, dto: CreatePackageDto) {
    return this.prisma.package.create({
      data: {
        hostId,
        name: dto.name,
        description: dto.description,
        totalPrice: dto.totalPrice,
        items: { create: dto.items },
      },
      include: { items: true },
    });
  }

  findAll() {
    return this.prisma.package.findMany({
      include: { items: true, host: { select: { businessName: true } } },
    });
  }

  async findOne(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: { items: true, host: { select: { businessName: true } } },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async update(id: string, hostId: string, dto: UpdatePackageDto) {
    await this.assertOwnership(id, hostId);
    const { items, ...rest } = dto;
    return this.prisma.package.update({
      where: { id },
      data: {
        ...rest,
        ...(items && { items: { deleteMany: {}, create: items } }),
      },
      include: { items: true },
    });
  }

  async remove(id: string, hostId: string) {
    const pkg = await this.assertOwnership(id, hostId);
    if (pkg.photos?.length) await this.s3.deleteMany(pkg.photos);
    return this.prisma.package.delete({ where: { id } });
  }

  findByHost(hostId: string) {
    return this.prisma.package.findMany({ where: { hostId }, include: { items: true } });
  }

  private async assertOwnership(id: string, hostId: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.hostId !== hostId) throw new ForbiddenException();
    return pkg;
  }
}
