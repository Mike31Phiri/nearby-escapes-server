import { AddHostPayoutMethodDto } from './dto/host-finances.dto';
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

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'HOST' },
    });

    const profile = await this.prisma.hostProfile.upsert({
      where: { userId },
      create: {
        userId,
        businessName: dto.businessName,
        isApproved: false,
      },
      update: {
        businessName: dto.businessName,
      },
    });

    return {
      id: profile.id,
      userId: user.id,
      displayName: user.name,
      businessName: profile.businessName,
      verified: profile.isApproved,
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'HOST' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        hostProfile: {
          select: {
            id: true,
            businessName: true,
            isApproved: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Host not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      businessName: user.hostProfile?.businessName || null,
      isApproved: user.hostProfile?.isApproved || false,
      createdAt: user.createdAt,
    };
  }

  async findByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        hostProfile: {
          select: {
            id: true,
            businessName: true,
            isApproved: true,
          },
        },
      },
    });
    if (!user || user.role !== 'HOST') throw new NotFoundException('Host profile not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      businessName: user.hostProfile?.businessName || null,
      isApproved: user.hostProfile?.isApproved || false,
    };
  }

  async getHostStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        hostProfile: {
          select: {
            id: true,
            businessName: true,
            isApproved: true,
          },
        },
      },
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

    const isApproved = Boolean(user.hostProfile?.isApproved);
    return {
      hasProfile: Boolean(user.hostProfile),
      isApproved,
      hostId: userId,
      businessName: user.hostProfile?.businessName || null,
      role: isApproved ? ('host' as const) : ('host_pending' as const),
    };
  }

  async findApprovedByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        hostProfile: {
          select: {
            id: true,
            businessName: true,
            isApproved: true,
          },
        },
      },
    });
    if (!user || user.role !== 'HOST') throw new NotFoundException('Host profile not found');
    if (!user.hostProfile?.isApproved) throw new ForbiddenException('Your host account is pending admin approval');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      businessName: user.hostProfile.businessName,
      isApproved: user.hostProfile.isApproved,
    };
  }

  async getHostSettings(userId: string) {
    const profile = await this.prisma.hostProfile.findUnique({
      where: { userId },
    });
    return {
      businessName: profile?.businessName || null,
      defaultCheckInTime: profile?.defaultCheckInTime || '14:00',
      defaultCheckOutTime: profile?.defaultCheckOutTime || '10:00',
      payoutMethod: profile?.payoutMethod || 'BANK_TRANSFER',
      payoutAccount: profile?.payoutAccount || null,
      isApproved: profile?.isApproved || false,
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

    const updated = await this.prisma.hostProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...(dto.defaultCheckInTime ? { defaultCheckInTime: dto.defaultCheckInTime } : {}),
        ...(dto.defaultCheckOutTime ? { defaultCheckOutTime: dto.defaultCheckOutTime } : {}),
        ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
        ...(dto.payoutMethod !== undefined ? { payoutMethod: dto.payoutMethod } : {}),
        ...(dto.payoutAccount !== undefined ? { payoutAccount: dto.payoutAccount } : {}),
      },
      update: {
        ...(dto.defaultCheckInTime ? { defaultCheckInTime: dto.defaultCheckInTime } : {}),
        ...(dto.defaultCheckOutTime ? { defaultCheckOutTime: dto.defaultCheckOutTime } : {}),
        ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
        ...(dto.payoutMethod !== undefined ? { payoutMethod: dto.payoutMethod } : {}),
        ...(dto.payoutAccount !== undefined ? { payoutAccount: dto.payoutAccount } : {}),
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

  async submitApplication(userId: string, dto: import('./dto/onboard-host.dto').OnboardHostDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const app = await this.prisma.hostApplication.upsert({
      where: { userId },
      create: {
        userId,
        businessName: dto.businessName,
        operatingSince: dto.operatingSince,
        province: dto.province,
        town: dto.town,
        businessEmail: dto.businessEmail,
        businessPhone: dto.businessPhone,
        pacraDocs: dto.pacraDocs ?? undefined,
        ownershipDocs: dto.ownershipDocs ?? undefined,
        operationDocs: dto.operationDocs ?? undefined,
        status: 'pending_review',
      },
      update: {
        businessName: dto.businessName,
        operatingSince: dto.operatingSince,
        province: dto.province,
        town: dto.town,
        businessEmail: dto.businessEmail,
        businessPhone: dto.businessPhone,
        pacraDocs: dto.pacraDocs ?? undefined,
        ownershipDocs: dto.ownershipDocs ?? undefined,
        operationDocs: dto.operationDocs ?? undefined,
        status: 'pending_review',
        reviewerNotes: null,
      },
    });

    await this.prisma.hostProfile.upsert({
      where: { userId },
      create: {
        userId,
        businessName: dto.businessName,
      },
      update: {
        businessName: dto.businessName,
      },
    });

    return {
      applicationId: app.id,
      userId: app.userId,
      businessName: app.businessName,
      status: app.status,
      submittedAt: app.createdAt,
      message: 'Application submitted. Our verification team will review your documents within 1–3 business days.',
    };
  }

  async getApplicationStatus(userId: string) {
    const app = await this.prisma.hostApplication.findUnique({
      where: { userId },
    });

    if (!app) {
      const profile = await this.prisma.hostProfile.findUnique({
        where: { userId },
      });
      return {
        applicationId: null,
        status: profile?.isApproved ? 'approved' : 'not_applied',
        businessName: profile?.businessName || null,
        submittedAt: null,
        reviewerNotes: null,
      };
    }

    return {
      applicationId: app.id,
      status: app.status,
      businessName: app.businessName,
      submittedAt: app.createdAt,
      reviewerNotes: app.reviewerNotes,
    };
  }

  async addPayoutMethod(userId: string, dto: AddHostPayoutMethodDto) {
    const details = dto.details || {
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
      provider: dto.provider,
      mobileNumber: dto.mobileNumber,
    };
    const methodType = dto.type === 'mobile_money' ? 'MOBILE_MONEY' : 'BANK_TRANSFER';
    const accountStr = JSON.stringify(details);

    await this.prisma.hostProfile.upsert({
      where: { userId },
      create: {
        userId,
        payoutMethod: methodType,
        payoutAccount: accountStr,
      },
      update: {
        payoutMethod: methodType,
        payoutAccount: accountStr,
      },
    });

    const newId = `pm_${Date.now()}`;
    return {
      success: true,
      message: 'Payout method saved successfully.',
      payoutMethod: {
        id: newId,
        type: dto.type,
        isDefault: dto.isDefault ?? true,
        details,
      },
    };
  }

  async removePayoutMethod(userId: string, id: string) {
    await this.prisma.hostProfile.updateMany({
      where: { userId },
      data: {
        payoutAccount: null,
      },
    });
    return {
      success: true,
      message: 'Payout method removed successfully.',
    };
  }

  async setDefaultPayoutMethod(userId: string, id: string) {
    return {
      success: true,
      message: 'Default payout method updated.',
    };
  }

}
