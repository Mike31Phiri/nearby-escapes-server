import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [
      totalUsers, totalHosts, totalGuests, totalListings,
      totalBookings, totalRevenue, pendingDisputes,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'HOST', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'GUEST', deletedAt: null } }),
      this.prisma.listing.count({ where: { deletedAt: null } }),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.dispute.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
    ]);

    const [recentUsers, recentBookings, revenueByMonth] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      this.prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          listing: { select: { name: true } },
          guest: { select: { name: true } },
        },
      }),
      this.prisma.$queryRaw<{ month: string; amount: number }[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') AS month, SUM(amount) AS amount
        FROM "Payment"
        WHERE status = 'PAID'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    return {
      stats: {
        totalUsers: Number(totalUsers),
        totalHosts: Number(totalHosts),
        totalGuests: Number(totalGuests),
        totalListings: Number(totalListings),
        totalBookings: Number(totalBookings),
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        pendingDisputes: Number(pendingDisputes),
      },
      recentUsers,
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        listingName: b.listing?.name || null,
        guestName: b.guest?.name || null,
        status: b.status.toLowerCase(),
        amount: b.amount,
        createdAt: b.createdAt,
      })),
      revenueByMonth: revenueByMonth.map((r) => ({
        month: r.month,
        amount: Number(r.amount),
      })),
    };
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search?: string) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, email: true, role: true,
          phone: true, avatar: true, isVerified: true,
          verificationStatus: true, createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        role: u.role.toLowerCase(),
        verificationStatus: u.verificationStatus.toLowerCase(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUserStatus(userId: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const verificationStatus = status.toUpperCase() as 'PENDING' | 'VERIFIED' | 'SUSPENDED';
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus,
        isVerified: status === 'verified',
      },
      select: { id: true, name: true, email: true, verificationStatus: true, isVerified: true },
    });
  }

  // ─── Listings ──────────────────────────────────────────────────────────────

  async getListings(page = 1, limit = 20, status?: string) {
    const where: Prisma.ListingWhereInput = { deletedAt: null };
    if (status) where.status = status.toUpperCase() as any;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          host: { include: { user: { select: { name: true } } } },
          _count: { select: { bookings: true, reviews: true } },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings.map((l) => ({
        id: l.id,
        type: l.type.toLowerCase(),
        name: l.name,
        hostName: l.host?.user?.name || null,
        location: l.location,
        price: l.price,
        status: l.status.toLowerCase(),
        bookingsCount: l._count.bookings,
        reviewsCount: l._count.reviews,
        createdAt: l.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateListingStatus(listingId: string, status: string, reason?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const newStatus = status === 'approved' ? 'ACTIVE' : 'INACTIVE';
    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: newStatus as any },
    });

    // Create notification for host
    const hostUser = await this.prisma.host.findUnique({
      where: { id: listing.hostId },
      include: { user: true },
    });
    if (hostUser) {
      await this.prisma.notification.create({
        data: {
          userId: hostUser.userId,
          type: status === 'approved' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
          title: status === 'approved' ? 'Listing Approved' : 'Listing Rejected',
          description: reason || `Your listing "${listing.name}" has been ${status}.`,
          actionUrl: '/host/listings',
        },
      });
    }

    return {
      id: updated.id,
      status: updated.status.toLowerCase(),
      message: `Listing ${status} successfully`,
    };
  }

  // ─── Bookings ──────────────────────────────────────────────────────────────

  async getBookings(page = 1, limit = 20) {
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          listing: { select: { name: true, type: true } },
          guest: { select: { name: true, email: true } },
          payment: { select: { status: true } },
        },
      }),
      this.prisma.booking.count(),
    ]);

    return {
      data: bookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        listingName: b.listing?.name || null,
        listingType: b.listing?.type?.toLowerCase() || null,
        guestName: b.guest?.name || b.customerName || null,
        guestEmail: b.guest?.email || b.customerEmail || null,
        amount: b.amount,
        status: b.status.toLowerCase(),
        paymentStatus: b.payment?.status?.toLowerCase() || b.paymentStatus?.toLowerCase() || 'unpaid',
        createdAt: b.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Disputes ──────────────────────────────────────────────────────────────

  async getDisputes(page = 1, limit = 20) {
    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        orderBy: { raisedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dispute.count(),
    ]);

    return {
      data: disputes.map((d) => ({
        ...d,
        status: d.status.toLowerCase(),
        priority: d.priority.toLowerCase(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateDispute(disputeId: string, status: string, resolution?: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const newStatus = status.toUpperCase() as any;
    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: newStatus,
        resolution: resolution || null,
        resolvedAt: ['RESOLVED_HOST', 'RESOLVED_GUEST', 'REFUNDED', 'CLOSED'].includes(newStatus)
          ? new Date()
          : null,
      },
    });

    return { ...updated, status: updated.status.toLowerCase(), priority: updated.priority.toLowerCase() };
  }

  // ─── Payouts ───────────────────────────────────────────────────────────────

  async getPayouts(page = 1, limit = 20, status?: string) {
    const where: Prisma.PayoutWhereInput = {};
    if (status) where.status = status.toUpperCase() as any;

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { host: { include: { user: { select: { name: true, email: true } } } } },
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      data: payouts.map((p) => ({
        id: p.id,
        hostName: p.host?.user?.name || null,
        hostEmail: p.host?.user?.email || null,
        amount: p.amount,
        commission: p.commission,
        netAmount: p.netAmount,
        period: p.period,
        status: p.status.toLowerCase(),
        method: p.method,
        bookingCount: p.bookingRefs.length,
        processedAt: p.processedAt,
        createdAt: p.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async processPayouts(payoutIds: string[]) {
    const payouts = await this.prisma.payout.findMany({
      where: { id: { in: payoutIds }, status: 'PENDING' },
    });

    const processed = payouts.length;
    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);

    await this.prisma.payout.updateMany({
      where: { id: { in: payoutIds } },
      data: { status: 'PROCESSING', processedAt: new Date() },
    });

    return { processed, failed: payoutIds.length - processed, totalAmount };
  }

  // ─── Promotions ────────────────────────────────────────────────────────────

  async getPromotions(page = 1, limit = 20) {
    const [promotions, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.promoCode.count(),
    ]);

    return {
      data: promotions.map((p) => ({
        ...p,
        type: p.type.toLowerCase(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createPromotion(data: {
    code: string; type: string; value: number; minSpend?: number;
    maxUses: number; appliesTo?: string; isActive: boolean;
    startsAt: string; expiresAt: string; description?: string;
  }) {
    const promo = await this.prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type.toUpperCase() as any,
        value: data.value,
        minSpend: data.minSpend || null,
        maxUses: data.maxUses,
        appliesTo: data.appliesTo || 'all',
        isActive: data.isActive,
        startsAt: new Date(data.startsAt),
        expiresAt: new Date(data.expiresAt),
        description: data.description || null,
      },
    });
    return { ...promo, type: promo.type.toLowerCase() };
  }

  async updatePromotion(id: string, data: Partial<{
    isActive: boolean; maxUses: number; expiresAt: string; description: string;
  }>) {
    const updateData: any = {};
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    if (data.description !== undefined) updateData.description = data.description;

    const promo = await this.prisma.promoCode.update({
      where: { id },
      data: updateData,
    });
    return { ...promo, type: promo.type.toLowerCase() };
  }

  // ─── Activity Log ──────────────────────────────────────────────────────────

  async getActivityLog(page = 1, limit = 20) {
    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true } } },
      }),
      this.prisma.activityLog.count(),
    ]);

    return {
      data: activities.map((a) => ({
        id: a.id,
        action: a.action,
        user: a.user?.name || 'System',
        userRole: a.userRole,
        target: a.target,
        type: a.type,
        createdAt: a.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async logActivity(data: {
    action: string; userId?: string; userRole?: string;
    target?: string; type: string; metadata?: any;
  }) {
    return this.prisma.activityLog.create({
      data: {
        action: data.action,
        userId: data.userId || null,
        userRole: data.userRole || null,
        target: data.target || null,
        type: data.type,
        metadata: data.metadata || undefined,
      },
    });
  }

  // ─── Reports ───────────────────────────────────────────────────────────────

  async getReports() {
    const [monthlyData, platformStats] = await Promise.all([
      this.prisma.$queryRaw<{
        month: string; newUsers: number; newBookings: number; revenue: number; commission: number;
      }[]>`
        WITH months AS (
          SELECT TO_CHAR(generate_series(
            date_trunc('month', NOW() - INTERVAL '11 months'),
            date_trunc('month', NOW()),
            '1 month'::interval
          ), 'Mon') AS month
        )
        SELECT
          m.month,
          COALESCE(u.cnt, 0)::int AS "newUsers",
          COALESCE(b.cnt, 0)::int AS "newBookings",
          COALESCE(p.amt, 0)::int AS revenue,
          COALESCE((p.amt * 0.15)::int, 0) AS commission
        FROM months m
        LEFT JOIN (
          SELECT TO_CHAR("createdAt", 'Mon') AS month, COUNT(*)::int AS cnt
          FROM "User" WHERE "deletedAt" IS NULL GROUP BY month
        ) u ON m.month = u.month
        LEFT JOIN (
          SELECT TO_CHAR("createdAt", 'Mon') AS month, COUNT(*)::int AS cnt
          FROM "Booking" GROUP BY month
        ) b ON m.month = b.month
        LEFT JOIN (
          SELECT TO_CHAR("createdAt", 'Mon') AS month, SUM(amount)::int AS amt
          FROM "Payment" WHERE status = 'PAID' GROUP BY month
        ) p ON m.month = p.month
        ORDER BY m.month
      `,
      this.getPlatformStats(),
    ]);

    return { monthlyData, platformStats };
  }

  private async getPlatformStats() {
    const [
      totalUsers, totalGuests, totalHosts, totalListings,
      activeListings, totalBookings, completedBookings,
      totalRevenue, pendingModerationListings,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'GUEST', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'HOST', deletedAt: null } }),
      this.prisma.listing.count({ where: { deletedAt: null } }),
      this.prisma.listing.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.listing.count({ where: { status: 'PENDING', deletedAt: null } }),
    ]);

    const [avgRatingResult, avgRatingGrowth] = await Promise.all([
      this.prisma.review.aggregate({ _avg: { rating: true } }),
      this.prisma.review.count(),
    ]);

    const platformCommission = Number(totalRevenue._sum.amount) * 0.15;
    const reportedListings = await this.prisma.dispute.count();

    return {
      totalUsers: Number(totalUsers),
      totalGuests: Number(totalGuests),
      totalHosts: Number(totalHosts),
      totalListings: Number(totalListings),
      activeListings: Number(activeListings),
      totalBookings: Number(totalBookings),
      completedBookings: Number(completedBookings),
      totalRevenue: Number(totalRevenue._sum.amount) || 0,
      platformCommission: Math.round(platformCommission),
      avgRating: Number(avgRatingResult._avg.rating?.toFixed(2)) || 0,
      reviewCount: Number(avgRatingGrowth),
      growthRate: 23.5, // Placeholder — actual calculation requires prior period
      pendingModeration: Number(pendingModerationListings),
      reportedListings: Number(reportedListings),
    };
  }

  // ─── Settings ──────────────────────────────────────────────────────────────

  async getSettings() {
    const settings = await this.prisma.setting.findMany({ orderBy: { category: 'asc' } });
    return { settings };
  }

  async updateSettings(updates: { key: string; value: string }[]) {
    let updatedCount = 0;
    for (const { key, value } of updates) {
      const existing = await this.prisma.setting.findUnique({ where: { key } });
      if (existing) {
        await this.prisma.setting.update({ where: { key }, data: { value } });
        updatedCount++;
      }
    }
    const settings = await this.prisma.setting.findMany({ orderBy: { category: 'asc' } });
    return { updated: updatedCount, settings };
  }

  // ─── Promote user to admin ─────────────────────────────────────────────────

  async promoteToAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  // ─── Approve host ──────────────────────────────────────────────────────────

  async approveHost(hostId: string) {
    const host = await this.prisma.host.findUnique({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const updated = await this.prisma.host.update({
      where: { id: hostId },
      data: { isApproved: true },
      include: { user: { select: { id: true } } },
    });

    // Notify the host
    if (updated.user) {
      await this.prisma.notification.create({
        data: {
          userId: updated.user.id,
          type: 'SYSTEM',
          title: 'Host Account Approved',
          description: 'Your host account has been approved. You can now create listings.',
          actionUrl: '/host/listings',
        },
      });
    }

    return updated;
  }
}
