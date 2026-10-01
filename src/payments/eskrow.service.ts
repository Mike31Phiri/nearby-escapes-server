import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { PaymentStatus } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import type { User } from '@prisma/client';

// ---------------------------------------------------------------------------
// Eskrow Gateway – Integration scaffold
//
// All values marked  ← TODO  must be updated once the real Eskrow API docs
// are received:
//   • Replace BASE_URL_SANDBOX / BASE_URL_PRODUCTION with the real URLs
//   • Replace endpoint paths (/initiate, /verify, /release) if they differ
//   • Replace header names / auth scheme if Eskrow uses something other than Bearer
//   • Align request & response shapes with the actual Eskrow contract
// ---------------------------------------------------------------------------

/** Shape of the payload sent to Eskrow when initiating a payment/hold */
interface EskrowInitiatePayload {
  amount: number;       // amount in minor units (e.g. ngwe / cents) – TODO: confirm with docs
  currency: string;     // e.g. 'ZMW'
  reference: string;    // our internal bookingRef
  description: string;
  callbackUrl: string;  // Eskrow will POST the webhook here
  redirectUrl: string;  // browser redirect after payment
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  // TODO: add any additional fields Eskrow requires (e.g. merchant_id, split_rules)
}

/** Minimal shape of the Eskrow initiate response – TODO: align with actual response */
interface EskrowInitiateResponse {
  success: boolean;
  transactionId: string; // TODO: confirm exact field name from Eskrow docs
  paymentUrl: string;    // URL to redirect the user to for payment
}

/** Minimal shape of the Eskrow verify/status response – TODO: align with actual response */
interface EskrowVerifyResponse {
  success: boolean;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED'; // TODO: confirm Eskrow status codes
  transactionId: string;
  reference: string;
  amount: number;
}

/** Shape of the Eskrow webhook payload – TODO: align with actual Eskrow webhook docs */
export interface EskrowWebhookPayload {
  event: string;        // e.g. 'payment.successful', 'payment.failed', 'funds.released'
  transactionId: string;
  reference: string;    // our bookingRef
  status: string;
  amount: number;
  currency: string;
}

@Injectable()
export class EskrowService {
  private readonly logger = new Logger(EskrowService.name);

  // ── Base URLs ── TODO: replace with real Eskrow URLs once docs are provided ──
  private static readonly BASE_URL_SANDBOX = 'https://sandbox.eskrow.com/api/v1';     // TODO
  private static readonly BASE_URL_PRODUCTION = 'https://api.eskrow.com/api/v1';       // TODO

  // ── Endpoints ── TODO: update paths if the actual Eskrow paths differ ──
  private static readonly ENDPOINT_INITIATE = '/payment/initiate'; // TODO
  private static readonly ENDPOINT_VERIFY = '/payment/verify';     // TODO
  private static readonly ENDPOINT_RELEASE = '/escrow/release';    // TODO
  private static readonly ENDPOINT_STATUS = '/payment/status';     // TODO

  private readonly apiClient: AxiosInstance;
  private readonly webhookSecret: string;
  private readonly appUrl: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {
    const isProduction = config.get<string>('NODE_ENV') === 'production';
    const baseUrl = isProduction
      ? EskrowService.BASE_URL_PRODUCTION
      : EskrowService.BASE_URL_SANDBOX;

    const apiKey = config.get<string>('ESKROW_API_KEY') || '';        // TODO: confirm header name
    const secretKey = config.get<string>('ESKROW_SECRET_KEY') || '';  // TODO: may be needed for HMAC signing

    this.webhookSecret = config.get<string>('ESKROW_WEBHOOK_SECRET') || ''; // TODO
    this.appUrl = config.get<string>('APP_URL') || 'http://localhost:3001';

    // ── Axios instance pre-configured for Eskrow ──
    // TODO: update Authorization header scheme if Eskrow does not use Bearer
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,   // TODO: confirm auth scheme
        'X-Secret-Key': secretKey,           // TODO: remove if not needed
      },
      timeout: 30_000,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 1. Initiate Payment / Create Escrow Hold
  //    Called when the user clicks "Pay Now" after the 10-min booking hold.
  // ────────────────────────────────────────────────────────────────────────────
  async createPaymentToken(user: User, dto: CreateTokenDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingRef: dto.bookingRef },
    });

    if (!booking) throw new BadRequestException('Booking not found.');

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new BadRequestException('This booking has been cancelled or has expired.');
    }

    if (booking.status === 'PENDING' && booking.expiresAt && booking.expiresAt < new Date()) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException(
        'Your 10-minute booking hold has expired. Please start a new booking.',
      );
    }

    const [firstName, ...lastParts] = dto.customer.name.split(' ');
    const lastName = lastParts.join(' ') || firstName;
    const callbackUrl = `${this.appUrl}/api/payments/webhook`;
    const redirectUrl =
      dto.callbackUrl ||
      `${this.config.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/checkout/confirmation`;

    const payload: EskrowInitiatePayload = {
      amount: dto.amount, // TODO: confirm if Eskrow wants minor units or decimal
      currency: dto.currency || 'ZMW',
      reference: dto.bookingRef,
      description: `Booking ${dto.bookingRef} – Nearby Escapes`,
      callbackUrl,
      redirectUrl,
      customer: {
        name: `${firstName} ${lastName}`.trim(),
        email: dto.customer.email || user.email,
        phone: dto.customer.phone,
      },
    };

    try {
      const response = await this.apiClient.post<EskrowInitiateResponse>(
        EskrowService.ENDPOINT_INITIATE,
        payload,
      );

      const result = response.data;

      if (!result?.success || !result?.transactionId) {
        throw new Error('Eskrow did not return a valid transaction ID.');
      }

      await this.prisma.booking.update({
        where: { bookingRef: dto.bookingRef },
        data: { transToken: result.transactionId },
      });

      await this.prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: { providerRef: result.transactionId, amount: dto.amount },
        create: {
          bookingId: booking.id,
          userId: user.id,
          amount: dto.amount,
          status: 'UNPAID' as PaymentStatus,
          provider: 'ESKROW',
          providerRef: result.transactionId,
        },
      });

      return {
        success: true,
        transactionId: result.transactionId,
        paymentUrl: result.paymentUrl,
        bookingRef: dto.bookingRef,
        message: 'Payment initiated with Eskrow. Redirect the user to paymentUrl.',
      };
    } catch (err: any) {
      this.logger.error(`Eskrow initiate failed: ${err.message}`, err.response?.data);
      throw new BadRequestException(`Payment initialization failed: ${err.message}`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. Verify Payment Status
  //    Frontend calls this after the user returns from Eskrow's payment page.
  // ────────────────────────────────────────────────────────────────────────────
  async verifyPayment(transactionId: string) {
    try {
      // TODO: confirm URL structure – some gateways use GET /verify?id=xxx vs GET /verify/:id
      const response = await this.apiClient.get<EskrowVerifyResponse>(
        `${EskrowService.ENDPOINT_VERIFY}/${transactionId}`,
      );

      const result = response.data;
      const payment = await this.prisma.payment.findFirst({
        where: { providerRef: transactionId },
        include: { booking: true },
      });

      const isSuccessful = result?.status === 'SUCCESSFUL'; // TODO: confirm status string

      if (isSuccessful && payment) {
        await this._confirmPayment(payment, transactionId);
      } else if (result?.status === 'FAILED' && payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'UNPAID' },
        });
      }

      return {
        success: isSuccessful,
        transactionId,
        status: result?.status,
        bookingRef: payment?.booking?.bookingRef || null,
      };
    } catch (err: any) {
      this.logger.error(`Eskrow verify failed: ${err.message}`, err.response?.data);
      throw new BadRequestException('Payment verification failed.');
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. Webhook / Callback Handler
  //    Eskrow POSTs status updates here asynchronously.
  // ────────────────────────────────────────────────────────────────────────────
  async handleWebhook(payload: EskrowWebhookPayload, signature?: string): Promise<void> {
    // TODO: implement HMAC/signature verification using this.webhookSecret
    // Example – adapt to Eskrow's actual signing algorithm once docs are received:
    // import * as crypto from 'crypto';
    // const expectedSig = crypto
    //   .createHmac('sha256', this.webhookSecret)
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    // if (signature !== expectedSig) throw new BadRequestException('Invalid webhook signature');

    const { transactionId, status, event } = payload;
    this.logger.log(
      `Eskrow webhook – event: ${event}, status: ${status}, txId: ${transactionId}`,
    );

    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: transactionId },
      include: { booking: { include: { guest: true } } },
    });

    if (!payment) {
      this.logger.warn(`No payment record for transactionId: ${transactionId}`);
      return;
    }

    // TODO: map the full set of Eskrow event/status strings once docs are available
    const isSuccessful =
      status === 'SUCCESSFUL' ||
      event === 'payment.successful' ||
      event === 'funds.released'; // TODO: confirm event names

    if (isSuccessful) {
      await this._confirmPayment(payment, transactionId);
    } else if (status === 'FAILED' || event === 'payment.failed') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'UNPAID' },
      });
      this.logger.warn(`Payment ${transactionId} marked FAILED via webhook.`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. Release Escrow Funds
  //    Called automatically on host check-in (inside BookingsService.checkIn).
  //    Notifies Eskrow to disburse the held funds to the host.
  // ────────────────────────────────────────────────────────────────────────────
  async releaseEscrowFunds(bookingRef: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingRef },
      include: { payment: true },
    });

    if (!booking?.payment?.providerRef) {
      this.logger.warn(`releaseEscrowFunds: no payment providerRef for booking ${bookingRef}`);
      return;
    }

    try {
      // TODO: confirm exact Eskrow release payload structure
      await this.apiClient.post(EskrowService.ENDPOINT_RELEASE, {
        transactionId: booking.payment.providerRef,
        reference: bookingRef,
        // TODO: add host bank details / split percentages if required by Eskrow
      });

      this.logger.log(`Eskrow funds released for booking ${bookingRef}`);
    } catch (err: any) {
      this.logger.error(
        `Eskrow release failed for ${bookingRef}: ${err.message}`,
        err.response?.data,
      );
      // Non-fatal: payout record is already created internally; this is a best-effort call.
      // TODO: consider adding a retry queue / alert here.
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────────────────────

  private async _confirmPayment(
    payment: { id: string; bookingId: string; userId: string; booking?: any },
    transactionId: string,
  ) {
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID' as PaymentStatus },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        expiresAt: null,
      },
    });

    if (payment.booking?.guest?.email) {
      await this.notifications.sendPaymentReceipt(
        payment.booking.guest.email,
        payment.booking.guest.name,
        payment.booking.bookingRef,
        payment.booking.totalPrice,
      );
    }

    this.logger.log(`Payment ${transactionId} confirmed. Booking set to CONFIRMED.`);
  }
}
