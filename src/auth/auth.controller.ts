import { Body, Controller, Get, Post, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User } from '@prisma/client';

const COOKIE_NAME = 'access_token';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Returns user object and sets HttpOnly cookie' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: any) {
    const { token, user, message } = await this.authService.register(dto);
    this.setCookie(res, token);
    return {
      user,
      accessToken: token,
      message: message || 'Registration successful. Welcome to Nearby Escapes!',
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with 6-digit code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: any) {
    const result = await this.authService.verifyEmail(dto);
    if (result.token) {
      this.setCookie(res, result.token);
    }
    return result;
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification code' })
  @ApiResponse({ status: 200, description: 'Verification code resent' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const { token, user } = await this.authService.login(dto);
    this.setCookie(res, token);
    return { user, accessToken: token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear session cookie' })
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user from JWT' })
  me(@CurrentUser() user: User) {
    return { user: this.authService.sanitize(user) };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setCookie(res: any, token: string) {
    const isProd = this.config.get('NODE_ENV') === 'production';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}
