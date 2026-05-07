import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { DpoService } from './dpo.service';
import { PaymentIntentDto } from './dto/payment-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentsController {
  constructor(private dpoService: DpoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAVELER')
  @Post('intent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate payment — returns DPO checkout URL' })
  async createIntent(@CurrentUser() user: any, @Body() dto: PaymentIntentDto) {
    const { transactionId, checkoutUrl } = await this.dpoService.initiatePayment(
      dto.amount,
      user.id,
      dto.bookingId,
      dto.currency,
    );
    return { intentId: transactionId, checkoutUrl, status: 'pending' };
  }

  @Post('dpo-webhook')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'DPO payment webhook handler' })
  async handleDpoWebhook(@Req() req: Request) {
    await this.dpoService.handleCallback(req.body);
    return { status: 'success' };
  }
}
