import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
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

  // ── DPO Group Gateway Endpoints ──────────────────────────────────────────

  /**
   * DPO Step 1: Initiate DPO Payment
   * POST /api/payments/dpo/initiate
   */
  @UseGuards(JwtAuthGuard)
  @Post('dpo/initiate')
  @Version(['1', VERSION_NEUTRAL])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate DPO Group PayPage token' })
  @ApiBearerAuth('access-token')
  async initiateDpoPayment(
    @CurrentUser() user: User,
    @Body() dto: CreateTokenDto,
  ) {
    return this.dpoService.createPaymentToken(user, dto);
  }

  /**
   * DPO Step 2: Verify DPO Payment
   * POST /api/payments/dpo/verify or GET /api/payments/dpo/verify/:transToken
   */
  @UseGuards(JwtAuthGuard)
  @Post('dpo/verify')
  @Version(['1', VERSION_NEUTRAL])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify DPO transaction status via transToken' })
  @ApiBearerAuth('access-token')
  async verifyDpoPayment(
    @CurrentUser() user: User,
    @Body('transToken') transToken: string,
  ): Promise<Record<string, unknown>> {
    return this.dpoService.verifyPayment(transToken, user) as Promise<
      Record<string, unknown>
    >;
  }

  @UseGuards(JwtAuthGuard)
  @Get('dpo/verify/:transToken')
  @Version(['1', VERSION_NEUTRAL])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify DPO transaction status (GET alias)' })
  @ApiBearerAuth('access-token')
  async verifyDpoPaymentGet(
    @CurrentUser() user: User,
    @Param('transToken') transToken: string,
  ): Promise<Record<string, unknown>> {
    return this.dpoService.verifyPayment(transToken, user) as Promise<
      Record<string, unknown>
    >;
  }

  /**
   * DPO Step 3: Server-to-server IPN webhook callback
   * POST /api/payments/dpo/webhook
   */
  @Post('dpo/webhook')
  @Version(['1', VERSION_NEUTRAL])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'DPO IPN server-to-server webhook callback' })
  async handleDpoWebhook(@Body() payload: any) {
    await this.dpoService.handleCallback(payload);
    return { status: 'success' };
  }
}
