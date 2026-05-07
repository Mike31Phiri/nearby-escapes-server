import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalHosts,
      totalBookings,
      totalPayments,
      pendingPayouts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.host.count(),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.payout.aggregate({ where: { isPaid: false }, _sum: { amount: true } }),
    ]);

    return {
      totalUsers,
      totalHosts,
      totalBookings,
      totalRevenue: totalPayments._sum.amount ?? 0,
      pendingPayouts: pendingPayouts._sum.amount ?? 0,
    };
  }

  async getBookingAnalytics() {
    const [byStatus, monthly] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, COUNT(*) AS count
        FROM "Booking"
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
      monthly: monthly.map((m) => ({ month: m.month, count: Number(m.count) })),
    };
  }

  async getPaymentAnalytics() {
    const [byStatus, totalCommission, monthly] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { commissionAmount: true },
      }),
      this.prisma.$queryRaw<{ month: string; total: number }[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, SUM(amount) AS total
        FROM "Payment"
        WHERE status = 'COMPLETED'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all, total: s._sum.amount ?? 0 })),
      totalCommission: totalCommission._sum.commissionAmount ?? 0,
      monthly,
    };
  }

  async getCommissions() {
    return this.prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: {
        id: true,
        bookingId: true,
        amount: true,
        commissionAmount: true,
        hostAmount: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPayouts(onlyPending: boolean) {
    return this.prisma.payout.findMany({
      where: onlyPending ? { isPaid: false } : {},
      include: { host: { select: { businessName: true, user: { select: { email: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPayoutPaid(payoutId: string) {
    return this.prisma.payout.update({
      where: { id: payoutId },
      data: { isPaid: true, paidAt: new Date() },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async promoteToAdmin(userId: string, requesterId: string) {
    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can promote other admins');
    }
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('User not found');
    if (target.role === 'ADMIN') throw new BadRequestException('User is already an admin');
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  async approveHost(hostId: string) {
    return this.prisma.host.update({
      where: { id: hostId },
      data: { isApproved: true },
    });
  }
}
