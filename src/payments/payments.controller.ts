import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DpoService } from './dpo.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private dpoService: DpoService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create DPO payment token' })
  @ApiBearerAuth('access-token')
  async createToken(@CurrentUser() user: User, @Body() dto: CreateTokenDto) {
    return this.dpoService.createPaymentToken(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify/:transToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiBearerAuth('access-token')
  async verifyPayment(@Param('transToken') transToken: string) {
    return this.dpoService.verifyPayment(transToken);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'DPO webhook/callback handler' })
  async handleWebhook(@Body() payload: any) {
    await this.dpoService.handleCallback(payload);
    return { status: 'success' };
  }
}
