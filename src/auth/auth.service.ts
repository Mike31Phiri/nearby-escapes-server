import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private jwt: JwtService,
    private notifications: NotificationsService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('An account with this email already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        phone: dto.phone || null,
        role: dto.role === 'host' ? 'HOST' : 'GUEST',
        // Host-specific fields (null for guests)
        businessName: dto.role === 'host' ? `${dto.name}'s Services` : null,
        isApproved: false,
      },
    });

    return { token: this.signToken(user.id, user.email), user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return { token: this.signToken(user.id, user.email), user: this.sanitize(user) };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) return { message: 'If this email exists, a reset link has been sent' };

    const token = randomUUID();
    const expiry = new Date(Date.now() + 1000 * 60 * 60);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${this.config.get('FRONTEND_URL') || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    await this.notifications.sendPasswordReset(user.email, user.name, resetUrl);

    return { message: 'If this email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { resetToken: dto.token } });
    if (!user) throw new BadRequestException('Invalid or expired reset token');
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Reset token has expired, please request a new one');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Password reset successfully.' };
  }

  sanitize(user: any) {
    const { password, resetToken, resetTokenExpiry, refreshToken, deletedAt, ...rest } = user;
    return {
      ...rest,
      // Frontend expects roles: UserRole[] (array). Backend stores a single role enum.
      roles: [user.role.toLowerCase()],
      // Keep role too for convenience
      role: user.role.toLowerCase(),
    };
  }

  signToken(sub: string, email: string): string {
    return this.jwt.sign({ sub, email });
  }
}
