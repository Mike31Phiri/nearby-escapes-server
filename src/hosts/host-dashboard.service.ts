import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(hostId: string) {
    const host = await this.prisma.host.findUnique({
      where: { id: hostId },
      include: { user: { select: { name: true, avatar: true } } },
    });
    if (!host) return { stats: { totalListings: 0, activeListings: 0, totalBookings: 0, pendingBookings: 0, totalRevenue: 0, averageRating: 0, reviewCount: 0 }, recentBookings: [], recentReviews: [], earningsByMonth: [] };

    const [listings, bookings, reviews, payments] = await Promise.all([
      this.prisma.listing.findMany({ where: { hostId, deletedAt: null } }),
      this.prisma.booking.findMany({
        where: {
          hostId: host.userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: { guest: { select: { name: true } }, listing: { select: { name: true, images: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.review.findMany({
        where: { listing: { hostId } },
        include: { guest: { select: { name: true } }, listing: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.payment.aggregate({
        where: { booking: { hostId: host.userId }, status: 'PAID' },
        _sum: { hostAmount: true },
      }),
    ]);

    const activeListings = listings.filter((l) => l.status === 'ACTIVE');
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
    const totalRevenue = Number(payments._sum.hostAmount || 0);

    const avgRating = await this.prisma.review.aggregate({
      where: { listing: { hostId } },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      stats: {
        totalListings: listings.length,
        activeListings: activeListings.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        totalRevenue,
        averageRating: Number((avgRating._avg.rating || 0).toFixed(2)),
        reviewCount: avgRating._count.id,
      },
      recentBookings: bookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        listingName: b.listing?.name || null,
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
        listingName: (r as any).listing?.name || null,
        guestName: r.guest?.name || null,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
      })),
      earningsByMonth: [],
    };
  }

  async getEarnings(hostId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'PAID',
        booking: { hostId: (await this.prisma.host.findUnique({ where: { id: hostId } }))?.userId },
      },
      select: { hostAmount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const monthlyMap = new Map<string, number>();
    let bookingCount = 0;
    for (const p of payments) {
      const key = p.createdAt.toISOString().substring(0, 7);
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.hostAmount || 0));
      bookingCount++;
    }

    return {
      total: payments.reduce((sum, p) => sum + Number(p.hostAmount || 0), 0),
      monthly: Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => b.month.localeCompare(a.month)),
    };
  }

  async getListings(hostId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { hostId, deletedAt: null },
      include: {
        _count: { select: { bookings: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return listings.map((l) => {
      const ratings = l.reviews.map((r) => r.rating);
      const avgRating = ratings.length
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 0;

      return {
        id: l.id,
        type: l.type.toLowerCase(),
        name: l.name,
        location: l.location,
        images: l.images,
        price: l.price,
        status: l.status.toLowerCase(),
        totalBookings: l._count.bookings,
        averageRating: avgRating,
        reviewCount: l._count.reviews,
        createdAt: l.createdAt,
      };
    });
  }
}
