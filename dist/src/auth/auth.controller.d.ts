import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private authService;
    private config;
    constructor(authService: AuthService, config: ConfigService);
    register(dto: RegisterDto, res: any): Promise<any>;
    login(dto: LoginDto, res: any): Promise<any>;
    logout(res: any): {
        message: string;
    };
    session(user: any): any;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private setCookie;
}
