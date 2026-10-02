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
import { DpoService } from './dpo.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private eskrowService: EskrowService,
    private dpoService: DpoService,
  ) {}

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

  // ── DPO Group Gateway Endpoints ──────────────────────────────────────────

  /**
   * DPO Step 1: Initiate DPO Payment
   * POST /api/payments/dpo/initiate
   */
  @UseGuards(JwtAuthGuard)
  @Post('dpo/initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate DPO Group PayPage token' })
  @ApiBearerAuth('access-token')
  async initiateDpoPayment(@CurrentUser() user: User, @Body() dto: CreateTokenDto) {
    return this.dpoService.createPaymentToken(user, dto);
  }

  /**
   * DPO Step 2: Verify DPO Payment
   * POST /api/payments/dpo/verify or GET /api/payments/dpo/verify/:transToken
   */
  @UseGuards(JwtAuthGuard)
  @Post('dpo/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify DPO transaction status via transToken' })
  @ApiBearerAuth('access-token')
  async verifyDpoPayment(@Body('transToken') transToken: string) {
    return this.dpoService.verifyPayment(transToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dpo/verify/:transToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify DPO transaction status (GET alias)' })
  @ApiBearerAuth('access-token')
  async verifyDpoPaymentGet(@Param('transToken') transToken: string) {
    return this.dpoService.verifyPayment(transToken);
  }

  /**
   * DPO Step 3: Server-to-server IPN webhook callback
   * POST /api/payments/dpo/webhook
   */
  @Post('dpo/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'DPO IPN server-to-server webhook callback' })
  async handleDpoWebhook(@Body() payload: any) {
    await this.dpoService.handleCallback(payload);
    return { status: 'success' };
  }

}
