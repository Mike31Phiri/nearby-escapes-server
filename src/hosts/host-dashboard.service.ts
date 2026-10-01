import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HostOverviewDto } from './dto/host-overview.dto';
import { HostScheduleTodayDto, HostScheduleItemDTO } from './dto/host-schedule.dto';
import { GetHostBookingsQueryDto, HostBookingListItemDto } from './dto/host-bookings.dto';
import {
  HostFinancesSummaryDto,
  HostPayoutMethodItemDto,
  HostPayoutMethodDetailsDto,
} from './dto/host-finances.dto';

@Injectable()
export class HostDashboardService {
  constructor(private prisma: PrismaService) {}

  private formatDateOnly(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return undefined;
    return dateObj.toISOString().slice(0, 10);
  }

  async getBookings(
    userId: string,
    query: GetHostBookingsQueryDto,
  ): Promise<HostBookingListItemDto[]> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [{ hostId: userId }, { property: { hostId: userId } }],
    };

    if (query.listingId) {
      where.propertyId = query.listingId;
    }

    if (query.status) {
      if (query.status === 'confirmed') {
        where.status = { in: ['CONFIRMED', 'CHECKED_IN'] };
      } else if (query.status === 'cancelled') {
        where.status = { in: ['CANCELLED', 'EXPIRED'] };
      } else if (query.status === 'completed') {
        where.status = 'COMPLETED';
      }
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return bookings.map((b) => {
      let status: 'confirmed' | 'cancelled' | 'completed' = 'confirmed';
      if (b.status === 'COMPLETED' || b.checkedOutAt) {
        status = 'completed';
      } else if (b.status === 'CANCELLED' || b.status === 'EXPIRED') {
        status = 'cancelled';
      } else {
        status = 'confirmed';
      }

      const vertical = (b.property?.type?.toLowerCase() || 'stay') as
        | 'stay'
        | 'experience'
        | 'transport';

      return {
        id: b.id,
        bookingRef: b.bookingRef,
        listingId: b.propertyId,
        listingTitle: b.property?.name || 'Listing',
        vertical,
        status,
        checkIn: this.formatDateOnly(b.checkIn) || null,
        checkOut: this.formatDateOnly(b.checkOut) || null,
        date: this.formatDateOnly(b.date) || null,
        guests: b.guests,
        totalNgwee: b.amount,
        guestName: b.customerName || b.guest?.name || 'Guest',
        guestPhone: b.customerPhone || b.guest?.phone || '',
        createdAt: b.createdAt.toISOString(),
      };
    });
  }

  async getFinancesSummary(userId: string): Promise<HostFinancesSummaryDto> {
    const host = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        payoutMethod: true,
        payoutAccount: true,
      },
    });

    // Lifetime earnings: sum of hostAmount from all PAID payments
    const lifetimeAggr = await this.prisma.payment.aggregate({
      where: { booking: { hostId: userId }, status: 'PAID' },
      _sum: { hostAmount: true, amount: true },
    });
    const lifetimeEarningsNgwee = Number(
      lifetimeAggr._sum.hostAmount ?? lifetimeAggr._sum.amount ?? 0,
    );

    // Pending payouts: Payouts with status PENDING or PROCESSING
    const pendingPayoutsAggr = await this.prisma.payout.aggregate({
      where: {
        hostId: userId,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      _sum: { netAmount: true, amount: true },
    });
    const pendingPayoutsNgwee = Number(
      pendingPayoutsAggr._sum.netAmount ?? pendingPayoutsAggr._sum.amount ?? 0,
    );

    // Completed payouts: Payouts already PAID
    const paidPayoutsAggr = await this.prisma.payout.aggregate({
      where: {
        hostId: userId,
        status: 'PAID',
      },
      _sum: { netAmount: true, amount: true },
    });
    const paidPayoutsNgwee = Number(
      paidPayoutsAggr._sum.netAmount ?? paidPayoutsAggr._sum.amount ?? 0,
    );

    // Available balance: lifetime earnings minus what has already been disbursed or in processing
    const availableBalanceNgwee = Math.max(
      0,
      lifetimeEarningsNgwee - paidPayoutsNgwee - pendingPayoutsNgwee,
    );

    // Next scheduled settlement: upcoming Friday (or 7 days later if today is Friday)
    const now = new Date();
    const nextPayout = new Date(now);
    const dayOfWeek = nextPayout.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    nextPayout.setDate(nextPayout.getDate() + daysUntilFriday);
    const nextPayoutDate = nextPayout.toISOString().slice(0, 10);

    // Build payout methods array
    const payoutMethods: HostPayoutMethodItemDto[] = [];
    if (host?.payoutAccount) {
      let details: HostPayoutMethodDetailsDto = {};
      let isMobile = false;

      try {
        details = JSON.parse(host.payoutAccount);
        isMobile = !!(details.mobileNumber || details.provider);
      } catch {
        const raw = host.payoutAccount.trim();
        if (
          host.payoutMethod === 'MOBILE_MONEY' ||
          raw.startsWith('+') ||
          raw.startsWith('09') ||
          raw.startsWith('07')
        ) {
          isMobile = true;
          details = {
            mobileNumber: raw,
            provider:
              raw.includes('97') || raw.includes('77') ? 'Airtel Money' : 'MTN Mobile Money',
          };
        } else {
          details = {
            accountNumber: raw,
            bankName: 'Bank Account',
          };
        }
      }

      payoutMethods.push({
        id: 'pm-primary',
        type: isMobile || host.payoutMethod === 'MOBILE_MONEY' ? 'mobile_money' : 'bank_transfer',
        isDefault: true,
        details,
      });
    }

    return {
      currency: 'ZMW',
      availableBalanceNgwee,
      pendingPayoutsNgwee,
      lifetimeEarningsNgwee,
      nextPayoutDate,
      payoutMethods,
    };
  }

  async getOverview(userId: string): Promise<HostOverviewDto> {
    const host = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!host) {
      return {
        stats: {
          totalRevenueNgwee: 0,
          activeListingsCount: 0,
          todayCheckInsCount: 0,
          todayCheckOutsCount: 0,
          currentlyHostingCount: 0,
          occupancyRatePercent: 0,
          averageRating: 0,
        },
        unreadNotificationsCount: 0,
      };
    }

    const [activeListingsCount, totalRevenueAggr, avgRatingAggr, unreadNotificationsCount, schedule] =
      await Promise.all([
        this.prisma.property.count({
          where: { hostId: userId, status: 'ACTIVE', deletedAt: null },
        }),
        this.prisma.payment.aggregate({
          where: { booking: { hostId: userId }, status: 'PAID' },
          _sum: { hostAmount: true, amount: true },
        }),
        this.prisma.review.aggregate({
          where: { property: { hostId: userId } },
          _avg: { rating: true },
        }),
        this.prisma.notification.count({
          where: { userId, isRead: false },
        }),
        this.getTodaySchedule(userId),
      ]);

    const totalRevenueNgwee = Number(
      totalRevenueAggr._sum.hostAmount ?? totalRevenueAggr._sum.amount ?? 0,
    );
    const averageRating = Number((avgRatingAggr._avg?.rating || 0).toFixed(2));
    const todayCheckInsCount = schedule.arriving.length;
    const todayCheckOutsCount = schedule.departing.length;
    const currentlyHostingCount = schedule.hosting.length;

    const occupancyRatePercent =
      activeListingsCount > 0
        ? Math.min(100, Math.round((currentlyHostingCount / activeListingsCount) * 100))
        : 0;

    return {
      stats: {
        totalRevenueNgwee,
        activeListingsCount,
        todayCheckInsCount,
        todayCheckOutsCount,
        currentlyHostingCount,
        occupancyRatePercent,
        averageRating,
      },
      unreadNotificationsCount,
    };
  }

  async getTodaySchedule(userId: string): Promise<HostScheduleTodayDto> {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const startOfRecent = new Date();
    startOfRecent.setDate(startOfRecent.getDate() - 3);
    startOfRecent.setHours(0, 0, 0, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [{ hostId: userId }, { property: { hostId: userId } }],
          },
          {
            OR: [
              { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
              { status: 'COMPLETED', updatedAt: { gte: startOfRecent } },
            ],
          },
        ],
      },
      include: {
        property: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
        guest: {
          select: { id: true, name: true, phone: true, email: true, avatar: true },
        },
        stay: true,
        experience: true,
        transport: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const arriving: HostScheduleItemDTO[] = [];
    const hosting: HostScheduleItemDTO[] = [];
    const departing: HostScheduleItemDTO[] = [];

    const statusMap: Record<string, 'confirmed' | 'checked_in' | 'checked_out'> = {
      CONFIRMED: 'confirmed',
      CHECKED_IN: 'checked_in',
      COMPLETED: 'checked_out',
    };

    for (const booking of bookings) {
      const listingType = (booking.property?.type?.toLowerCase() || 'stay') as
        | 'stay'
        | 'experience'
        | 'transport';

      const checkInDateStr =
        this.formatDateOnly(booking.checkIn) || this.formatDateOnly(booking.date) || todayStr;
      const checkOutDateStr = this.formatDateOnly(booking.checkOut);

      let stayProgress: string | undefined = undefined;
      if (listingType === 'stay' && checkInDateStr && checkOutDateStr) {
        const checkInTime = new Date(checkInDateStr).getTime();
        const checkOutTime = new Date(checkOutDateStr).getTime();
        const totalNights = Math.max(
          1,
          Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)),
        );
        const todayTime = new Date(todayStr).getTime();
        const elapsedDays = Math.floor((todayTime - checkInTime) / (1000 * 60 * 60 * 24));
        const currentNight = Math.min(totalNights, Math.max(1, elapsedDays + 1));
        stayProgress = `Night ${currentNight} of ${totalNights}`;
      }

      const mappedStatus: 'confirmed' | 'checked_in' | 'checked_out' =
        statusMap[booking.status] ||
        (booking.checkedOutAt ? 'checked_out' : booking.checkedInAt ? 'checked_in' : 'confirmed');

      const baseItem = {
        id: booking.id,
        listingType,
        bookingRef: booking.bookingRef,
        guestName: booking.customerName || booking.guest?.name || 'Guest',
        guestPhone: booking.customerPhone || booking.guest?.phone || '',
        guestEmail: booking.customerEmail || booking.guest?.email || '',
        guestAvatar: booking.guest?.avatar || undefined,
        listingId: booking.propertyId,
        listingName: booking.property?.name || 'Listing',
        listingImage: (booking.property as any)?.images?.[0]?.url || '',
        checkInDate: checkInDateStr,
        checkOutDate: checkOutDateStr,
        timeSlot: booking.timeSlot || undefined,
        stayProgress,
        guestCount: booking.guests,
        totalAmountNgwee: booking.amount,
        currency: (booking.currency === 'USD' ? 'USD' : 'ZMW') as 'ZMW' | 'USD',
        status: mappedStatus,
      };

      // Arriving queue: checking in today, not already completed
      if (checkInDateStr === todayStr && booking.status !== 'COMPLETED') {
        arriving.push({
          ...baseItem,
          type: 'arriving',
        });
      }

      // Departing queue: checking out today
      if (checkOutDateStr === todayStr) {
        departing.push({
          ...baseItem,
          type: 'departing',
        });
      }

      // Hosting queue: currently checked in, or stay spans today
      const isCurrentlyHosting =
        booking.status === 'CHECKED_IN' ||
        (listingType === 'stay' &&
          checkInDateStr &&
          checkOutDateStr &&
          checkInDateStr <= todayStr &&
          checkOutDateStr > todayStr &&
          booking.status !== 'COMPLETED');

      if (isCurrentlyHosting) {
        hosting.push({
          ...baseItem,
          type: 'hosting',
        });
      }
    }

    return {
      arriving,
      hosting,
      departing,
    };
  }

  async getDashboard(userId: string) {
    const host = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, avatar: true, businessName: true },
    });
    if (!host) return {
      stats: { totalListings: 0, activeListings: 0, totalBookings: 0, pendingBookings: 0, totalRevenue: 0, averageRating: 0, reviewCount: 0 },
      recentBookings: [],
      recentReviews: [],
      earningsByMonth: [],
    };

    const [properties, bookings, reviews, payments] = await Promise.all([
      this.prisma.property.findMany({
        where: { hostId: userId, deletedAt: null },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
      this.prisma.booking.findMany({
        where: { hostId: userId, status: { in: ['PENDING', 'CONFIRMED'] } },
        include: { guest: { select: { name: true } }, property: { select: { name: true, images: { take: 1 } } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.review.findMany({
        where: { property: { hostId: userId } },
        include: { guest: { select: { name: true } }, property: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.payment.aggregate({
        where: { booking: { hostId: userId }, status: 'PAID' },
        _sum: { hostAmount: true },
      }),
    ]);

    const activeProperties = properties.filter((p) => p.status === 'ACTIVE');
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
    const totalRevenue = Number(payments._sum.hostAmount || 0);

    const avgRating = await this.prisma.review.aggregate({
      where: { property: { hostId: userId } },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      stats: {
        totalListings: properties.length,
        totalProperties: properties.length,
        activeListings: activeProperties.length,
        activeProperties: activeProperties.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        totalRevenue,
        averageRating: Number((avgRating._avg?.rating || 0).toFixed(2)),
        reviewCount: avgRating._count?.id || 0,
      },
      recentBookings: bookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        propertyName: b.property?.name || null,
        listingName: b.property?.name || null,
        thumbnailUrl: (b.property as any)?.images?.[0]?.url || null,
        guestName: b.guest?.name || null,
        guests: b.guests,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status.toLowerCase(),
        amount: b.amount,
        createdAt: b.createdAt,
      })),
      recentReviews: reviews.map((r) => ({
        id: r.id,
        propertyName: (r as any).property?.name || null,
        listingName: (r as any).property?.name || null,
        guestName: r.guest?.name || null,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
      })),
      earningsByMonth: [],
    };
  }

  async getEarnings(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { status: 'PAID', booking: { hostId: userId } },
      select: { hostAmount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const monthlyMap = new Map<string, number>();
    for (const p of payments) {
      const key = p.createdAt.toISOString().substring(0, 7);
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.hostAmount || 0));
    }

    return {
      total: payments.reduce((sum, p) => sum + Number(p.hostAmount || 0), 0),
      monthly: Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => b.month.localeCompare(a.month)),
    };
  }

  async getProperties(userId: string) {
    const properties = await this.prisma.property.findMany({
      where: { hostId: userId, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        stays: { where: { deletedAt: null, isActive: true } },
        experiences: { where: { deletedAt: null, isActive: true } },
        transports: { where: { deletedAt: null, isActive: true } },
        _count: { select: { bookings: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((p) => {
      const ratings = p.reviews.map((r) => r.rating);
      const avgRating = ratings.length
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 0;

      const price =
        p.stays[0]?.price ??
        p.experiences[0]?.price ??
        p.transports[0]?.pricePerSeat ??
        0;

      return {
        id: p.id,
        propertyId: p.id,
        listingId: p.id,
        type: p.type.toLowerCase(),
        name: p.name,
        location: p.location,
        thumbnailUrl: (p as any).images?.[0]?.url || null,
        price,
        priceFormatted: `K${(price / 100).toFixed(2)}`,
        status: p.status.toLowerCase(),
        totalBookings: p._count.bookings,
        averageRating: avgRating,
        reviewCount: p._count.reviews,
        unitsCount: p.stays.length + p.experiences.length + p.transports.length,
        createdAt: p.createdAt,
      };
    });
  }

  async getListings(userId: string) {
    return this.getProperties(userId);
  }
}
