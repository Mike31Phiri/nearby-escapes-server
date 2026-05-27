import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, CancellationPolicy } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { host: { include: { user: true } } },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.deletedAt || listing.status !== 'ACTIVE') {
      throw new BadRequestException('Listing is not available');
    }
    if (listing.host.userId === userId) {
      throw new BadRequestException('Cannot book your own listing');
    }

    // Generate booking reference: NE-YYYY-NNNN
    const year = new Date().getFullYear();
    const count = await this.prisma.booking.count();
    const bookingRef = `NE-${year}-${String(count + 1).padStart(4, '0')}`;

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef,
        listingId: dto.listingId,
        guestId: userId,
        hostId: listing.host.userId,
        amount: listing.price * dto.guests,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        date: dto.date ? new Date(dto.date) : null,
        guests: dto.guests,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail || null,
        specialRequests: dto.specialRequests || null,
      },
      include: { listing: true, guest: true },
    });

    // Send notifications
    const guest = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.notifications.sendBookingStatusUpdate(
      guest!.email, guest!.name, bookingRef, 'PENDING',
    );
    await this.notifications.sendHostBookingRequest(
      listing.host.user.email, listing.host.businessName, bookingRef, guest!.name,
    );

    return this.formatBooking(booking);
  }

  async findOne(id: string, userId: string, userRole: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: { include: { host: { include: { user: { select: { name: true } } } } } }, guest: { select: { name: true, email: true, phone: true } }, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.hostId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException();
    }
    return this.formatBooking(booking);
  }

  async findMyBookings(userId: string, role?: string) {
    const where: any = {};
    if (role === 'host') {
      where.hostId = userId;
    } else {
      where.guestId = userId;
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: { listing: { include: { host: { include: { user: { select: { name: true } } } } } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.formatBooking(b));
  }

  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status === 'CANCELLED') throw new BadRequestException('Booking already cancelled');
    if (booking.status === 'COMPLETED') throw new BadRequestException('Cannot cancel completed booking');

    // Calculate refund based on cancellation policy
    const policy = (booking.listing.cancellationPolicy || 'MODERATE') as CancellationPolicy;
    let refundAmount = 0;
    const daysUntilCheckIn = booking.checkIn
      ? Math.ceil((booking.checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    switch (policy) {
      case 'FLEXIBLE':
        refundAmount = daysUntilCheckIn >= 1 ? booking.amount : 0;
        break;
      case 'MODERATE':
        refundAmount = daysUntilCheckIn >= 5 ? booking.amount : booking.amount * 0.5;
        break;
      case 'STRICT':
        refundAmount = 0;
        break;
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        refundAmount: Math.round(refundAmount),
        paymentStatus: refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
      },
      include: { listing: true, guest: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.notifications.sendCancellationConfirmation(
      user!.email, user!.name, booking.bookingRef, refundAmount,
    );

    return {
      status: 'cancelled',
      refundEligible: refundAmount > 0,
      refundAmount: Math.round(refundAmount),
      policy: policy.toLowerCase(),
      message: refundAmount > 0
        ? `Refund of ZMW ${refundAmount} processed. Amount will reflect in 5-7 business days.`
        : 'No refund applicable based on the cancellation policy.',
    };
  }

  async updateStatus(id: string, userId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: { include: { host: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.listing.host.userId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking already processed');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { listing: true, guest: true },
    });

    const guest = await this.prisma.user.findUnique({ where: { id: booking.guestId } });
    await this.notifications.sendBookingStatusUpdate(
      guest!.email, guest!.name, booking.bookingRef, status,
    );

    return this.formatBooking(updated);
  }

  private formatBooking(booking: any) {
    const listing = booking.listing;
    const guest = booking.guest;

    return {
      id: booking.id,
      bookingRef: booking.bookingRef,
      type: listing?.type?.toLowerCase() || null,
      listingId: booking.listingId,
      listingName: listing?.name || null,
      guestId: booking.guestId,
      hostId: booking.hostId,
      status: booking.status.toLowerCase(),
      amount: booking.amount,
      currency: booking.currency,
      paymentStatus: booking.payment?.status?.toLowerCase() || booking.paymentStatus?.toLowerCase() || 'unpaid',
      details: {
        checkIn: booking.checkIn?.toISOString().split('T')[0] || null,
        checkOut: booking.checkOut?.toISOString().split('T')[0] || null,
        date: booking.date?.toISOString().split('T')[0] || null,
        guests: booking.guests,
      },
      customer: {
        name: booking.customerName || guest?.name || null,
        phone: booking.customerPhone || guest?.phone || null,
        email: booking.customerEmail || guest?.email || null,
      },
      specialRequests: booking.specialRequests || null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
