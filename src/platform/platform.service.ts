import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  constructor(private prisma: PrismaService) {}

  async checkHealth() {
    return this.getHealth();
  }

  async getHealth() {
    let dbStatus = 'ok';
    let dbLatencyMs = 0;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'error';
    }

    const mem = process.memoryUsage();

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      },
    };
  }

  async getPublicSettings() {
    const settings = await this.prisma.setting.findMany({
      where: { category: 'platform' },
      select: { key: true, value: true },
    });
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  }

  /**
   * Returns platform-wide public data: stats, featured properties, popular locations.
   * All queries run in parallel for efficiency at scale.
   */
  async getBootstrap() {
    const [
      userCount,
      hostCount,
      guestCount,
      propertyCount,
      activePropertyCount,
      bookingCount,
      completedBookingCount,
      avgRatingResult,
      reviewCount,
      paymentAgg,
      gems,
      locations,
      settings,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'HOST', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'GUEST', deletedAt: null } }),
      this.prisma.property.count({ where: { deletedAt: null } }),
      this.prisma.property.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
      this.prisma.review.count(),
      this.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      // Gems: top 8 recent active properties with 4+ star reviews
      this.prisma.property.findMany({
        where: { deletedAt: null, status: 'ACTIVE', reviews: { some: { rating: { gte: 4 } } } },
        include: {
          host: { select: { name: true, avatar: true, hostProfile: { select: { businessName: true } } } },
          reviews: { select: { rating: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          stays: { where: { deletedAt: null, isActive: true }, take: 1 },
          experiences: { where: { deletedAt: null, isActive: true }, take: 1 },
          transports: { where: { deletedAt: null, isActive: true }, take: 1 },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      // Unique locations from active properties
      this.prisma.property.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { location: true },
        distinct: ['location'],
        take: 20,
      }),
      // Public settings
      this.prisma.setting.findMany({
        where: { category: 'platform' },
        select: { key: true, value: true },
      }),
    ]);

    const avgRating = Number((avgRatingResult._avg.rating || 0).toFixed(2));
    const totalRevenue = Number(paymentAgg._sum.amount || 0);

    return {
      stats: {
        totalUsers: Number(userCount),
        totalHosts: Number(hostCount),
        totalGuests: Number(guestCount),
        totalListings: Number(propertyCount),
        totalProperties: Number(propertyCount),
        activeListings: Number(activePropertyCount),
        activeProperties: Number(activePropertyCount),
        totalBookings: Number(bookingCount),
        completedBookings: Number(completedBookingCount),
        avgRating,
        reviewCount: Number(reviewCount),
        totalRevenue,
        platformCommission: Math.round(totalRevenue * 0.15),
      },
      featured: {
        gems: gems.map((p) => {
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
            currency: p.currency,
            rating: p.reviews?.length
              ? Number((p.reviews.reduce((a: number, b: any) => a + b.rating, 0) / p.reviews.length).toFixed(1))
              : 0,
            reviewCount: p._count?.reviews || 0,
            hostName: (p.host as any)?.hostProfile?.businessName || p.host?.name || null,
          };
        }),
      },
      locations: [...new Set(locations.map((l) => l.location))].slice(0, 20),
      settings: settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>),
    };
  }

  /**
   * Returns user-specific data to enrich the bootstrap response.
   * Called when a valid JWT is present on the request.
   * All queries run in parallel for maximum efficiency.
   */
  async getUserBootstrap(userId: string) {
    const [unreadNotifications, wishlist, hostStatus, recentBookings, user] = await Promise.all([
      this.prisma.notification.count({ where: { userId, isRead: false } }),
      this.prisma.wishlist.findUnique({
        where: { userId },
        select: { _count: { select: { items: true } } },
      }),
      this.prisma.user.findUnique({
        where: { id: userId, role: 'HOST' },
        select: {
          id: true,
          hostProfile: { select: { businessName: true, isApproved: true } },
        },
      }),
      this.prisma.booking.findMany({
        where: { guestId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          bookingRef: true,
          status: true,
          amount: true,
          createdAt: true,
          property: { select: { name: true, type: true, images: { take: 1 } } },
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      user: user
        ? { ...user, role: user.role.toLowerCase(), joinedAt: user.createdAt }
        : null,
      unreadNotifications: Number(unreadNotifications),
      wishlistCount: wishlist?._count?.items || 0,
      hostStatus: hostStatus
        ? {
            hasProfile: Boolean(hostStatus.hostProfile),
            isApproved: Boolean(hostStatus.hostProfile?.isApproved),
            hostId: hostStatus.id,
            businessName: hostStatus.hostProfile?.businessName || null,
            role: hostStatus.hostProfile?.isApproved ? ('host' as const) : ('host_pending' as const),
          }
        : {
            hasProfile: false,
            isApproved: false,
            hostId: null,
            businessName: null,
            role: 'guest' as const,
          },
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        status: b.status.toLowerCase(),
        amount: b.amount,
        amountFormatted: `K${(b.amount / 100).toFixed(2)}`,
        propertyName: b.property?.name || null,
        listingName: b.property?.name || null,
        propertyType: b.property?.type?.toLowerCase() || null,
        listingType: b.property?.type?.toLowerCase() || null,
        thumbnailUrl: (b.property as any)?.images?.[0]?.url || null,
        createdAt: b.createdAt,
      })),
    };
  }
}
