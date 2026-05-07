import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { Prisma, PaymentStatus } from '@prisma/client';

const COMMISSION_RATE = 0.1;

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async initiate(userId: string, dto: InitiatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException();
    if (booking.status !== 'APPROVED') {
      throw new BadRequestException('Booking must be approved before payment');
    }

    const existing = await this.prisma.payment.findUnique({ where: { bookingId: dto.bookingId } });
    if (existing?.status === 'COMPLETED') throw new BadRequestException('Booking already paid');

    const amount = Number(booking.totalAmount);
    const commissionAmount = amount * COMMISSION_RATE;
    const hostAmount = amount - commissionAmount;

    // Create payment record
    const payment = await this.prisma.payment.upsert({
      where: { bookingId: dto.bookingId },
      create: {
        bookingId: dto.bookingId,
        userId,
        amount,
        commissionAmount,
        hostAmount,
        provider: 'dpo', // Default to DPO as PayPal is removed
        providerRef: `dpo-${Date.now()}`, // Placeholder for DPO reference
        status: 'PENDING',
      },
      update: { provider: 'dpo', status: 'PENDING' },
    });

    return { payment, message: 'Payment initiated successfully with DPO' };
  }

}
