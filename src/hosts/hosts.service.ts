import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostDto } from './dto/create-host.dto';

@Injectable()
export class HostsService {
  constructor(private prisma: PrismaService) {}

  async createHost(userId: string, dto: CreateHostDto) {
    const existing = await this.prisma.host.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Already registered as a host');

    const host = await this.prisma.host.create({
      data: { userId, businessName: dto.businessName },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    await this.prisma.user.update({ where: { id: userId }, data: { role: 'HOST' } });

    return {
      id: host.id,
      userId: host.userId,
      displayName: `${host.user.firstName} ${host.user.lastName}`.trim(),
      businessName: host.businessName,
      verified: host.isApproved,
    };
  }

  async findById(id: string) {
    const host = await this.prisma.host.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!host) throw new NotFoundException('Host not found');
    return host;
  }

  async findByUserId(userId: string) {
    const host = await this.prisma.host.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!host) throw new NotFoundException('Host profile not found');
    return host;
  }

  async findApprovedByUserId(userId: string) {
    const host = await this.prisma.host.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!host) throw new NotFoundException('Host profile not found');
    if (!host.isApproved) throw new ForbiddenException('Your host account is pending admin approval');
    return host;
  }
}
