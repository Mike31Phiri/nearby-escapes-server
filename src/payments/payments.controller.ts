import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EskrowService } from './eskrow.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private eskrowService: EskrowService) {}

  /**
   * Step 1 – Initiate payment.
   * Creates an Eskrow escrow hold and returns a paymentUrl to redirect the user to.
   */
  @UseGuards(JwtAuthGuard)
  @Post('create-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate Eskrow escrow payment' })
  @ApiBearerAuth('access-token')
  async createToken(@CurrentUser() user: User, @Body() dto: CreateTokenDto) {
    return this.eskrowService.createPaymentToken(user, dto);
  }

  /**
   * Step 2 – Verify payment.
   * Frontend calls this after user returns from Eskrow's payment page.
   * Pass the transactionId returned by createToken.
   */
  @UseGuards(JwtAuthGuard)
  @Get('verify/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Eskrow payment status' })
  @ApiBearerAuth('access-token')
  async verifyPayment(@Param('transactionId') transactionId: string) {
    return this.eskrowService.verifyPayment(transactionId);
  }

  /**
   * Webhook – Eskrow POSTs async payment status updates here.
   * TODO: add signature header name once Eskrow docs are received.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eskrow webhook/callback handler' })
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-eskrow-signature') signature?: string, // TODO: confirm Eskrow signature header name
  ) {
    await this.eskrowService.handleWebhook(payload, signature);
    return { status: 'success' };
  }
}
