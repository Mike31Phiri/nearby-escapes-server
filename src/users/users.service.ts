import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { S3Service } from '../uploads/s3.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private s3?: S3Service,
  ) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { bookingsAsGuest: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const reviewStats = await this.prisma.review.aggregate({
      where: { guestId: id },
      _count: { id: true },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role.toLowerCase(),
      homeCity: user.homeCity,
      bio: user.bio,
      joinedAt: user.createdAt,
      stats: {
        totalBookings: user.bookingsAsGuest.length,
        totalReviews: reviewStats._count.id,
        memberSince: user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
    };
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        homeCity: true,
        bio: true,
        createdAt: true,
        businessName: true,
        isApproved: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      ...user,
      role: user.role.toLowerCase(),
      joinedAt: user.createdAt,
    };
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    const data: Record<string, any> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.homeCity !== undefined) data.homeCity = dto.homeCity;
    if (dto.bio !== undefined) data.bio = dto.bio;

    if (Object.keys(data).length === 0) {
      return this.getProfile(id);
    }

    await this.prisma.user.update({ where: { id }, data });
    return this.getProfile(id);
  }
}
