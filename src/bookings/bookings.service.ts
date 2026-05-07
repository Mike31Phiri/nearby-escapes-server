import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancellationPolicy, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';

const CLEANING_FEE = 50;
const SERVICE_FEE_RATE = 0.12;
const TAX_RATE = 0.1;

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private config: ConfigService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const acc = await this.prisma.accommodation.findUnique({
      where: { id: dto.stayId },
      include: { host: { include: { user: true } } },
    });
    if (!acc) throw new NotFoundException('Stay not found');
    if (acc.availableRooms < 1) throw new BadRequestException('No rooms available');

    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < 1) throw new BadRequestException('Check-out must be after check-in');

    const pricePerNight = Number(acc.pricePerNight);
    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    const taxes = Math.round(subtotal * TAX_RATE);
    const total = subtotal + CLEANING_FEE + serviceFee + taxes;

    const approvalToken = randomUUID();
    const confirmationId = `NE-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        totalAmount: total,
        approvalToken,
        confirmationId,
        checkIn,
        checkOut,
        guests: dto.guests,
        guestFirstName: dto.guestInfo.firstName,
        guestLastName: dto.guestInfo.lastName,
        guestEmail: dto.guestInfo.email,
        guestPhone: dto.guestInfo.phone,
        specialRequests: dto.guestInfo.specialRequests,
        items: {
          create: {
            itemType: 'ACCOMMODATION',
            accommodation: { connect: { id: dto.stayId } },
            quantity: dto.guests,
            unitPrice: acc.pricePerNight,
            subtotal: new Prisma.Decimal(subtotal),
          },
        },
        history: { create: { userId, status: 'PENDING' } },
      },
      include: { user: true },
    });

    const appUrl = this.config.get('FRONTEND_URL');
    await this.notifications.sendBookingPending(booking.user.email, booking.user.firstName, booking.id);
    await this.notifications.sendHostApprovalRequest(
      acc.host.user.email,
      acc.host.businessName,
      booking.id,
      `${booking.user.firstName} ${booking.user.lastName}`,
      `${appUrl}/bookings/approve?token=${approvalToken}`,
      `${appUrl}/bookings/reject?token=${approvalToken}`,
    );

    return this.formatBooking(booking, acc, { pricePerNight, nights, subtotal, serviceFee, taxes, total });
  }

  async findMyBookings(userId: string, status?: string, page = 1, limit = 10) {
    const where: any = { userId };
    if (status) where.status = status.toUpperCase();

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          items: { include: { accommodation: { include: { host: { include: { user: true } } } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const data = bookings.map((b) => {
      const acc = b.items[0]?.accommodation;
      const pricePerNight = Number(acc?.pricePerNight ?? 0);
      const nights = b.checkIn && b.checkOut
        ? Math.ceil((b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const subtotal = pricePerNight * nights;
      const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
      const taxes = Math.round(subtotal * TAX_RATE);
      const total = Number(b.totalAmount);
      return this.formatBooking(b, acc, { pricePerNight, nights, subtotal, serviceFee, taxes, total });
    });

    return data;
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        items: { include: { accommodation: { include: { host: { include: { user: true } } } } } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException();

    const acc = booking.items[0]?.accommodation;
    const pricePerNight = Number(acc?.pricePerNight ?? 0);
    const nights = booking.checkIn && booking.checkOut
      ? Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    const taxes = Math.round(subtotal * TAX_RATE);
    const total = Number(booking.totalAmount);
    return this.formatBooking(booking, acc, { pricePerNight, nights, subtotal, serviceFee, taxes, total });
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: { include: { accommodation: true } }, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException();
    if (booking.status === 'CANCELLED') throw new BadRequestException('Booking already cancelled');
    if (booking.status === 'REJECTED') throw new BadRequestException('Cannot cancel a rejected booking');

    const refundAmount = this.calculateRefund(booking);

    await this.prisma.$transaction(async (tx) => {
      if (booking.status === 'APPROVED') {
        await tx.accommodation.update({
          where: { id: booking.items[0]?.accommodationId! },
          data: { availableRooms: { increment: 1 } },
        });
      }
      await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          refundAmount,
          history: { create: { userId, status: 'CANCELLED' } },
        },
      });
      if (booking.payment && refundAmount > 0) {
        await tx.payment.update({ where: { id: booking.payment.id }, data: { status: 'REFUNDED' } });
      }
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.notifications.sendCancellationConfirmation(user!.email, user!.firstName, id, Number(refundAmount));

    return { status: 'cancelled', refundAmount };
  }

  async approveByToken(token: string) {
    return this.updateStatusByToken(token, 'APPROVED');
  }

  async rejectByToken(token: string) {
    return this.updateStatusByToken(token, 'REJECTED');
  }

  async approveByHost(id: string, hostId: string) {
    await this.assertHostOwnsBooking(id, hostId);
    return this.updateBookingStatus(id, 'APPROVED');
  }

  async rejectByHost(id: string, hostId: string) {
    await this.assertHostOwnsBooking(id, hostId);
    return this.updateBookingStatus(id, 'REJECTED');
  }

  async findHostBookings(hostId: string) {
    return this.prisma.booking.findMany({
      where: { items: { some: { accommodation: { hostId } } } },
      include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private formatBooking(booking: any, acc: any, fees: any) {
    const host = acc?.host;
    return {
      id: booking.id,
      stayId: acc?.id ?? null,
      stayName: acc?.name ?? null,
      stayImage: acc?.photos?.[0] ?? null,
      stayLocation: acc?.location ?? null,
      checkIn: booking.checkIn?.toISOString().split('T')[0] ?? null,
      checkOut: booking.checkOut?.toISOString().split('T')[0] ?? null,
      guests: booking.guests,
      status: booking.status.toLowerCase(),
      confirmationId: booking.confirmationId,
      fees: {
        pricePerNight: fees.pricePerNight,
        nights: fees.nights,
        subtotal: fees.subtotal,
        cleaningFee: CLEANING_FEE,
        serviceFee: fees.serviceFee,
        taxes: fees.taxes,
        total: fees.total,
      },
      host: host ? {
        id: host.id,
        displayName: `${host.user.firstName} ${host.user.lastName}`.trim(),
        avatarUrl: host.user.avatarUrl ?? null,
      } : null,
      createdAt: booking.createdAt,
    };
  }

  private calculateRefund(booking: any): number {
    if (!booking.payment || booking.payment.status !== 'COMPLETED') return 0;
    const totalPaid = Number(booking.payment.amount);
    const daysAgo = Math.floor((Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const policy = booking.items[0]?.accommodation?.cancellationPolicy ?? CancellationPolicy.MODERATE;
    switch (policy) {
      case CancellationPolicy.FLEXIBLE: return daysAgo <= 1 ? totalPaid : 0;
      case CancellationPolicy.MODERATE: return daysAgo <= 5 ? totalPaid : 0;
      case CancellationPolicy.STRICT: return daysAgo <= 7 ? totalPaid * 0.5 : 0;
      default: return 0;
    }
  }

  private async updateStatusByToken(token: string, status: 'APPROVED' | 'REJECTED') {
    const booking = await this.prisma.booking.findUnique({
      where: { approvalToken: token },
      include: { user: true },
    });
    if (!booking) throw new NotFoundException('Invalid or expired token');
    if (booking.status !== 'PENDING') throw new BadRequestException('Booking already processed');
    const updated = await this.updateBookingStatus(booking.id, status);
    await this.notifications.sendBookingStatusUpdate(booking.user.email, booking.user.firstName, booking.id, status);
    return updated;
  }

  private async updateBookingStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.$transaction(async (tx) => {
      const accId = booking.items[0]?.accommodationId;
      if (accId) {
        if (status === 'APPROVED') {
          await tx.accommodation.update({ where: { id: accId }, data: { availableRooms: { decrement: 1 } } });
        } else if ((status === 'REJECTED' || status === 'CANCELLED') && booking.status === 'APPROVED') {
          await tx.accommodation.update({ where: { id: accId }, data: { availableRooms: { increment: 1 } } });
        }
      }
      return tx.booking.update({
        where: { id },
        data: { status, history: { create: { userId: booking.userId, status } } },
      });
    });
  }

  private async assertHostOwnsBooking(bookingId: string, hostId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: { include: { accommodation: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.items.some((i) => i.accommodation?.hostId === hostId)) throw new ForbiddenException();
  }
}
