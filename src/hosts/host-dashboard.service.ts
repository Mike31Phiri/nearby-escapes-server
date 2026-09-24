import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostDashboardService {
  constructor(private prisma: PrismaService) {}

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
