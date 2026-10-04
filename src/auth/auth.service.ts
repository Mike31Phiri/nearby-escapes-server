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
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
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

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('An account with this email already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verificationCode = this.generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        phone: dto.phone || null,
        role: 'GUEST',
        isVerified: false,
        verificationStatus: 'PENDING',
        verificationCode,
        verificationCodeExpiry,
      },
    });

    // Send verification email via Resend to the guest
    await this.notifications.sendVerificationCode(user.email, user.name, verificationCode);

    return {
      token: this.signToken(user.id, user.email),
      user: this.sanitize(user),
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('Invalid email or verification code');
    }

    if (user.isVerified) {
      return {
        success: true,
        message: 'Email is already verified.',
        user: this.sanitize(user),
        token: this.signToken(user.id, user.email),
      };
    }

    if (!user.verificationCode || user.verificationCode !== dto.code.trim()) {
      throw new BadRequestException('Invalid verification code');
    }

    if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationStatus: 'VERIFIED',
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    return {
      success: true,
      message: 'Email verified successfully!',
      token: this.signToken(updatedUser.id, updatedUser.email),
      user: this.sanitize(updatedUser),
    };
  }

  async resendVerificationCode(dto: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If an account exists with this email, a verification code has been sent.' };
    }

    if (user.isVerified) {
      return { message: 'This email is already verified.' };
    }

    const code = this.generateVerificationCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationCodeExpiry: expiry,
      },
    });

    await this.notifications.sendVerificationCode(user.email, user.name, code);

    return { message: 'A new verification code has been sent to your email.' };
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
    const {
      password,
      resetToken,
      resetTokenExpiry,
      verificationCode,
      verificationCodeExpiry,
      refreshToken,
      deletedAt,
      hostProfile,
      ...rest
    } = user;
    const role = (user.role || 'GUEST').toLowerCase();
    const isHost = role === 'host';

    return {
      ...rest,
      // Frontend expects roles: UserRole[] (array) where hosts retain guest booking capabilities
      roles: isHost ? ['guest', 'host'] : [role],
      role,
      isHostVerified: isHost ? Boolean(hostProfile?.isApproved) : false,
    };
  }

  signToken(sub: string, email: string): string {
    return this.jwt.sign({ sub, email });
  }
}
