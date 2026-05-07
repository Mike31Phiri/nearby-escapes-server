import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUser(id: string, dto: UpdateUserDto, role: Role) {
    const data: Record<string, any> = {};

    if (dto.fullName) {
      const [firstName, ...rest] = dto.fullName.trim().split(' ');
      data.firstName = firstName;
      data.lastName = rest.join(' ') || '';
    }
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;

    // location: TRAVELER + HOST only
    if (dto.location !== undefined && role !== Role.ADMIN) {
      data.location = dto.location;
    }

    // bio: HOST only
    if (dto.bio !== undefined && role === Role.HOST) {
      data.bio = dto.bio;
    }

    const user = await this.prisma.user.update({ where: { id }, data });
    const { password, resetToken, resetTokenExpiry, ...rest } = user;
    return {
      ...rest,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role.toLowerCase().replace('traveler', 'guest'),
    };
  }
}
