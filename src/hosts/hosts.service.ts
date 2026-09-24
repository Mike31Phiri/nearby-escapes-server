import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostDto } from './dto/create-host.dto';

@Injectable()
export class HostsService {
  constructor(private prisma: PrismaService) {}

  async createHost(userId: string, dto: CreateHostDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'HOST') throw new BadRequestException('Already registered as a host');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'HOST',
        businessName: dto.businessName,
        isApproved: false,
      },
    });

    return {
      id: updated.id,
      userId: updated.id,
      displayName: updated.name,
      businessName: updated.businessName,
      verified: updated.isApproved,
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'HOST' },
      select: { id: true, name: true, email: true, avatar: true, businessName: true, isApproved: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Host not found');
    return user;
  }

  async findByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, businessName: true, isApproved: true, role: true },
    });
    if (!user || user.role !== 'HOST') throw new NotFoundException('Host profile not found');
    return user;
  }

  async getHostStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, businessName: true, isApproved: true },
    });

    if (!user || user.role !== 'HOST') {
      return {
        hasProfile: false,
        isApproved: false,
        hostId: null,
        businessName: null,
        role: 'guest' as const,
      };
    }

    return {
      hasProfile: true,
      isApproved: user.isApproved,
      hostId: userId,
      businessName: user.businessName,
      role: user.isApproved ? ('host' as const) : ('host_pending' as const),
    };
  }

  async findApprovedByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, businessName: true, isApproved: true, role: true },
    });
    if (!user || user.role !== 'HOST') throw new NotFoundException('Host profile not found');
    if (!user.isApproved) throw new ForbiddenException('Your host account is pending admin approval');
    return user;
  }

  async getHostSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        businessName: true,
        defaultCheckInTime: true,
        defaultCheckOutTime: true,
        payoutMethod: true,
        payoutAccount: true,
        isApproved: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      businessName: user.businessName,
      defaultCheckInTime: user.defaultCheckInTime || '14:00',
      defaultCheckOutTime: user.defaultCheckOutTime || '10:00',
      payoutMethod: user.payoutMethod || 'BANK_TRANSFER',
      payoutAccount: user.payoutAccount,
      isApproved: user.isApproved,
    };
  }

  async updateHostSettings(userId: string, dto: {
    defaultCheckInTime?: string;
    defaultCheckOutTime?: string;
    businessName?: string;
    payoutMethod?: string;
    payoutAccount?: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.defaultCheckInTime ? { defaultCheckInTime: dto.defaultCheckInTime } : {}),
        ...(dto.defaultCheckOutTime ? { defaultCheckOutTime: dto.defaultCheckOutTime } : {}),
        ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
        ...(dto.payoutMethod !== undefined ? { payoutMethod: dto.payoutMethod } : {}),
        ...(dto.payoutAccount !== undefined ? { payoutAccount: dto.payoutAccount } : {}),
      },
      select: {
        id: true,
        businessName: true,
        defaultCheckInTime: true,
        defaultCheckOutTime: true,
        payoutMethod: true,
        payoutAccount: true,
        isApproved: true,
      },
    });

    return {
      message: 'Host settings updated successfully',
      settings: {
        businessName: updated.businessName,
        defaultCheckInTime: updated.defaultCheckInTime || '14:00',
        defaultCheckOutTime: updated.defaultCheckOutTime || '10:00',
        payoutMethod: updated.payoutMethod || 'BANK_TRANSFER',
        payoutAccount: updated.payoutAccount,
        isApproved: updated.isApproved,
      },
    };
  }
}

