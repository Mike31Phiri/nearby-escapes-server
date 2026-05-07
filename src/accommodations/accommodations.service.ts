import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto';

@Injectable()
export class AccommodationsService {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  async create(hostId: string, dto: CreateAccommodationDto) {
    return this.prisma.accommodation.create({
      data: { ...dto, hostId, availableRooms: dto.totalRooms },
    });
  }

  findAll() {
    return this.prisma.accommodation.findMany({ include: { host: { select: { businessName: true } } } });
  }

  async findOne(id: string) {
    const accommodation = await this.prisma.accommodation.findUnique({
      where: { id },
      include: { host: { select: { businessName: true } } },
    });
    if (!accommodation) throw new NotFoundException('Accommodation not found');
    return accommodation;
  }

  async update(id: string, hostId: string, dto: UpdateAccommodationDto) {
    await this.assertOwnership(id, hostId);
    return this.prisma.accommodation.update({ where: { id }, data: dto });
  }

  async remove(id: string, hostId: string) {
    const accommodation = await this.assertOwnership(id, hostId);
    if (accommodation.photos?.length) await this.s3.deleteMany(accommodation.photos);
    return this.prisma.accommodation.delete({ where: { id } });
  }

  findByHost(hostId: string) {
    return this.prisma.accommodation.findMany({ where: { hostId } });
  }

  private async assertOwnership(id: string, hostId: string) {
    const accommodation = await this.prisma.accommodation.findUnique({ where: { id } });
    if (!accommodation) throw new NotFoundException('Accommodation not found');
    if (accommodation.hostId !== hostId) throw new ForbiddenException();
    return accommodation;
  }
}
