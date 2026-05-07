import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  async create(hostId: string, dto: CreateBusDto) {
    return this.prisma.bus.create({
      data: {
        ...dto,
        hostId,
        availableSeats: dto.totalSeats,
        departureTime: new Date(dto.departureTime),
        arrivalTime: new Date(dto.arrivalTime),
      },
    });
  }

  findAll() {
    return this.prisma.bus.findMany({ include: { host: { select: { businessName: true } } } });
  }

  async findOne(id: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: { host: { select: { businessName: true } } },
    });
    if (!bus) throw new NotFoundException('Bus not found');
    return bus;
  }

  async update(id: string, hostId: string, dto: UpdateBusDto) {
    await this.assertOwnership(id, hostId);
    const data: any = { ...dto };
    if (dto.departureTime) data.departureTime = new Date(dto.departureTime);
    if (dto.arrivalTime) data.arrivalTime = new Date(dto.arrivalTime);
    return this.prisma.bus.update({ where: { id }, data });
  }

  async remove(id: string, hostId: string) {
    const bus = await this.assertOwnership(id, hostId);
    if (bus.photos?.length) await this.s3.deleteMany(bus.photos);
    return this.prisma.bus.delete({ where: { id } });
  }

  findByHost(hostId: string) {
    return this.prisma.bus.findMany({ where: { hostId } });
  }

  private async assertOwnership(id: string, hostId: string) {
    const bus = await this.prisma.bus.findUnique({ where: { id } });
    if (!bus) throw new NotFoundException('Bus not found');
    if (bus.hostId !== hostId) throw new ForbiddenException();
    return bus;
  }
}
