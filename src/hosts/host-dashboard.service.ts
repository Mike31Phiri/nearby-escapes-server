import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(hostId: string) {
    const [host, accommodations, bookings, payments] = await Promise.all([
      this.prisma.host.findUnique({
        where: { id: hostId },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.accommodation.findMany({ where: { hostId } }),
      this.prisma.booking.findMany({
        where: {
          status: 'APPROVED',
          items: { some: { accommodation: { hostId } } },
        },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          booking: { items: { some: { accommodation: { hostId } } } },
        },
        _sum: { hostAmount: true },
      }),
    ]);

    const now = new Date();
    const upcomingBookings = bookings.filter(
      (b) => b.checkIn && new Date(b.checkIn) > now,
    ).length;

    return {
      host: {
        id: host!.id,
        userId: host!.userId,
        displayName: `${host!.user.firstName} ${host!.user.lastName}`.trim(),
        businessName: host!.businessName,
        verified: host!.isApproved,
      },
      stats: {
        totalEarnings: Number(payments._sum.hostAmount ?? 0),
        activeListings: accommodations.length,
        upcomingBookings,
        averageRating: 0, // populated once Feedback is aggregated
      },
      recentBookings: bookings,
      listings: accommodations,
    };
  }

  async getEarnings(hostId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        booking: { items: { some: { accommodation: { hostId } } } },
      },
      select: { hostAmount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const monthlyMap = new Map<string, number>();
    for (const p of payments) {
      const key = p.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.hostAmount));
    }

    return {
      total: payments.reduce((sum, p) => sum + Number(p.hostAmount), 0),
      monthly: Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => b.month.localeCompare(a.month)),
    };
  }

  async getCalendar(hostId: string, listingId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
        items: { some: { accommodationId: listingId, accommodation: { hostId } } },
        checkIn: { not: null },
        checkOut: { not: null },
      },
      select: {
        id: true,
        confirmationId: true,
        checkIn: true,
        checkOut: true,
        guests: true,
        status: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });

    return bookings;
  }

  async getListings(hostId: string) {
    return this.prisma.accommodation.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
