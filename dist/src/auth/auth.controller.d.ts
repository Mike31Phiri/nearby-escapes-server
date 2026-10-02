import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { User } from '@prisma/client';
export declare class AuthController {
    private authService;
    private config;
    constructor(authService: AuthService, config: ConfigService);
    register(dto: RegisterDto, res: any): Promise<{
        user: any;
        accessToken: string;
        message: string;
    }>;
    login(dto: LoginDto, res: any): Promise<{
        user: any;
        accessToken: string;
    }>;
    logout(res: any): {
        message: string;
    };
    me(user: User): {
        user: any;
    };
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private setCookie;
}
