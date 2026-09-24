import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { PaymentStatus } from '@prisma/client';
import axios from 'axios';
import type { User } from '@prisma/client';

@Injectable()
export class DpoService {
  private readonly logger = new Logger(DpoService.name);
  private readonly dpoApiUrl: string;
  private readonly companyToken: string;
  private readonly serviceTypeId: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {
    this.dpoApiUrl = 'https://secure.directpay.online/directtrade/TPG';
    this.companyToken = config.get<string>('DPO_COMPANY_TOKEN') || '';
    this.serviceTypeId = config.get<string>('DPO_SERVICE_TYPE_ID') || '6666';
  }

  async createPaymentToken(user: User, dto: CreateTokenDto) {
    const callbackUrl = dto.callbackUrl || `${this.config.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/checkout/confirmation`;

    const [firstName, ...lastNameParts] = dto.customer.name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const payload = {
      companyToken: this.companyToken,
      accountType: 'GENERAL',
      transaction: {
        paymentAmount: (dto.amount / 100).toFixed(2),
        paymentCurrency: dto.currency || 'ZMW',
        companyRef: dto.bookingRef,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: dto.customer.phone,
        customerEmail: dto.customer.email || user.email,
        serviceTypeId: this.serviceTypeId,
        redirectURL: callbackUrl,
        backURL: callbackUrl,
      },
    };

    try {
      const response = await axios.post(`${this.dpoApiUrl}/createToken`, payload);
      const result = response.data;

      if (result?.transToken) {
        // Find the booking first
        const booking = await this.prisma.booking.findUnique({ where: { bookingRef: dto.bookingRef } });
        if (!booking) throw new BadRequestException('Booking not found');

        if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
          throw new BadRequestException('This booking has been cancelled or has expired.');
        }

        if (booking.status === 'PENDING' && booking.expiresAt && booking.expiresAt < new Date()) {
          await this.prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'EXPIRED' },
          });
          throw new BadRequestException('Your 10-minute booking hold has expired. Please initiate a new booking.');
        }

        // Update booking with transToken
        await this.prisma.booking.update({
          where: { bookingRef: dto.bookingRef },
          data: { transToken: result.transToken },
        });

        // Upsert payment record using the booking's UUID
        await this.prisma.payment.upsert({
          where: { bookingId: booking.id },
          update: { providerRef: result.transToken, amount: dto.amount },
          create: {
            bookingId: booking.id,
            userId: user.id,
            amount: dto.amount,
            status: 'UNPAID' as PaymentStatus,
            provider: 'DPO',
            providerRef: result.transToken,
          },
        });

        return {
          success: true,
          transToken: result.transToken,
          paymentUrl: `https://secure.directpay.online/pay/${result.transToken}`,
          bookingRef: dto.bookingRef,
          message: 'Payment token created successfully.',
        };
      }

      throw new Error(result?.result || 'Failed to create DPO payment token');
    } catch (err: any) {
      this.logger.error(`DPO token creation failed: ${err.message}`);
      throw new BadRequestException(`Payment initialization failed: ${err.message}`);
    }
  }

  async verifyPayment(transToken: string) {
    try {
      const response = await axios.post(`${this.dpoApiUrl}/verifyToken`, {
        companyToken: this.companyToken,
        transToken,
      });

      const result = response.data;
      const payment = await this.prisma.payment.findFirst({
        where: { providerRef: transToken },
        include: { booking: true },
      });

      let status = 'pending';
      if (result?.result === '000' || result?.transactionStatus === 'SUCCESSFUL') {
        status = 'completed';
        if (payment) {
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
          if (payment.booking) {
            const guest = await this.prisma.user.findUnique({ where: { id: payment.userId } });
            if (guest) {
              await this.notifications.sendPaymentReceipt(
                guest.email, guest.name, payment.booking.bookingRef, payment.amount,
              );
            }
          }
        }
      } else if (result?.result !== '000') {
        status = 'failed';
      }

      return {
        success: status === 'completed',
        transToken,
        status,
        bookingRef: payment?.booking?.bookingRef || null,
        ...result,
      };
    } catch (err: any) {
      this.logger.error(`DPO verification failed: ${err.message}`);
      throw new BadRequestException('Payment verification failed');
    }
  }

  async handleCallback(payload: any): Promise<void> {
    const { transToken, status } = payload;

    if (!transToken) throw new BadRequestException('Invalid webhook payload');

    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: transToken },
      include: { booking: { include: { guest: true } } },
    });

    if (!payment) {
      this.logger.error(`Payment not found for token: ${transToken}`);
      return;
    }

    const isSuccessful = status === 'SUCCESSFUL' || status === '000';
    const newStatus: PaymentStatus = isSuccessful ? 'PAID' : 'UNPAID';

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    if (isSuccessful) {
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
          payment.amount,
        );
      }
    }

    this.logger.log(`Payment ${transToken} updated to ${newStatus}`);
  }
}
