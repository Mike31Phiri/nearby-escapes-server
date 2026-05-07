import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private prisma;
    private usersService;
    private jwt;
    private notifications;
    private config;
    constructor(prisma: PrismaService, usersService: UsersService, jwt: JwtService, notifications: NotificationsService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: any;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    sanitize(user: any): any;
    signToken(sub: string, email: string): string;
}
