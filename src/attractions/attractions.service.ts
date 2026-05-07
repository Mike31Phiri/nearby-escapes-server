import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';

@Injectable()
export class AttractionsService {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  async create(hostId: string, dto: CreateAttractionDto) {
    return this.prisma.attraction.create({
      data: { ...dto, hostId, availableSlots: dto.capacity },
    });
  }

  findAll() {
    return this.prisma.attraction.findMany({ include: { host: { select: { businessName: true } } } });
  }

  async findOne(id: string) {
    const attraction = await this.prisma.attraction.findUnique({
      where: { id },
      include: { host: { select: { businessName: true } } },
    });
    if (!attraction) throw new NotFoundException('Attraction not found');
    return attraction;
  }

  async update(id: string, hostId: string, dto: UpdateAttractionDto) {
    await this.assertOwnership(id, hostId);
    return this.prisma.attraction.update({ where: { id }, data: dto });
  }

  async remove(id: string, hostId: string) {
    const attraction = await this.assertOwnership(id, hostId);
    if (attraction.photos?.length) await this.s3.deleteMany(attraction.photos);
    return this.prisma.attraction.delete({ where: { id } });
  }

  findByHost(hostId: string) {
    return this.prisma.attraction.findMany({ where: { hostId } });
  }

  private async assertOwnership(id: string, hostId: string) {
    const attraction = await this.prisma.attraction.findUnique({ where: { id } });
    if (!attraction) throw new NotFoundException('Attraction not found');
    if (attraction.hostId !== hostId) throw new ForbiddenException();
    return attraction;
  }
}
