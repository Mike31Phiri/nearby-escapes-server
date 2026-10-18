import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GuestBookingItemDto,
  GuestBookingsGroupedDto,
  GetGuestBookingsQueryDto,
} from './dto/guest-bookings.dto';
import {
  toGuestBookingItem,
  formatBooking,
  groupBookingsByCategory,
} from './bookings.mapper';

@Injectable()
export class BookingReadService {
  constructor(private prisma: PrismaService) {}

  async getGuestBookingsGrouped(
    userId: string,
  ): Promise<GuestBookingsGroupedDto> {
    const bookings = await this.prisma.booking.findMany({
      where: { guestId: userId },
      include: {
        property: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            host: {
              select: {
                id: true,
                name: true,
                phone: true,
                hostProfile: { select: { businessName: true } },
              },
            },
          },
        },
        payment: true,
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    const items = bookings.map((b) => toGuestBookingItem(b, todayStr));

    const grouped = groupBookingsByCategory(items);

    return {
      upcoming: grouped.upcoming,
      active: grouped.active,
      recent: grouped.recent,
      cancelled: grouped.cancelled,
      stats: {
        totalBookingsCount: items.length,
        upcomingCount: grouped.upcoming.length,
        activeCount: grouped.active.length,
        recentCount: grouped.recent.length,
      },
    };
  }

  async getGuestBookings(
    userId: string,
    query: GetGuestBookingsQueryDto,
  ): Promise<GuestBookingItemDto[]> {
    const targetUserId = query.userId || userId;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const grouped = await this.getGuestBookingsGrouped(targetUserId);

    let list: GuestBookingItemDto[] = [];
    if (query.category === 'upcoming') {
      list = grouped.upcoming;
    } else if (query.category === 'active') {
      list = grouped.active;
    } else if (query.category === 'recent') {
      list = grouped.recent;
    } else if (query.category === 'cancelled') {
      list = grouped.cancelled;
    } else {
      list = [
        ...grouped.active,
        ...grouped.upcoming,
        ...grouped.recent,
        ...grouped.cancelled,
      ];
    }

    const skip = (page - 1) * limit;
    return list.slice(skip, skip + limit);
  }

  async findOne(id: string, userId: string, userRole: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingRef: id }],
      },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                phone: true,
                hostProfile: { select: { businessName: true } },
              },
            },
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
        guest: { select: { name: true, email: true, phone: true } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (
      booking.guestId !== userId &&
      booking.hostId !== userId &&
      userRole !== 'ADMIN'
    ) {
      throw new ForbiddenException();
    }
    return formatBooking(booking);
  }

  async getReceipt(id: string, userId: string, userRole: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingRef: id }] },
      include: {
        property: { select: { name: true } },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            provider: true,
            providerRef: true,
            receiptUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (
      booking.guestId !== userId &&
      booking.hostId !== userId &&
      userRole !== 'ADMIN'
    ) {
      throw new ForbiddenException();
    }
    if (!booking.payment || booking.payment.status !== 'PAID') {
      throw new BadRequestException(
        'A payment receipt is available after the booking is paid',
      );
    }

    return {
      bookingRef: booking.bookingRef,
      propertyName: booking.property.name,
      amount: booking.payment.amount,
      currency: booking.currency,
      status: booking.payment.status.toLowerCase(),
      provider: booking.payment.provider,
      transactionReference: booking.payment.providerRef,
      receiptUrl: booking.payment.receiptUrl,
      paidAt: booking.payment.updatedAt,
      issuedAt: booking.payment.createdAt,
    };
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
      include: {
        property: {
          include: {
            host: {
              select: {
                name: true,
                hostProfile: { select: { businessName: true } },
              },
            },
          },
        },
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => formatBooking(b));
  }
}
