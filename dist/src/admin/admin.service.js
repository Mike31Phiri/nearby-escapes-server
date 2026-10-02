"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [totalUsers, totalHosts, totalGuests, totalListings, totalBookings, totalRevenue, pendingDisputes,] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { role: 'HOST', deletedAt: null } }),
            this.prisma.user.count({ where: { role: 'GUEST', deletedAt: null } }),
            this.prisma.property.count({ where: { deletedAt: null } }),
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
                    property: { select: { name: true } },
                    guest: { select: { name: true } },
                },
            }),
            this.prisma.$queryRaw `
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
                propertyName: b.property?.name || null,
                listingName: b.property?.name || null,
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
    async getUsers(page = 1, limit = 20, search) {
        const where = { deletedAt: null };
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
    async updateUserStatus(userId, status) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const verificationStatus = status.toUpperCase();
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                verificationStatus,
                isVerified: status === 'verified',
            },
            select: { id: true, name: true, email: true, verificationStatus: true, isVerified: true },
        });
    }
    async getProperties(page = 1, limit = 20, status) {
        const where = { deletedAt: null };
        if (status)
            where.status = status.toUpperCase();
        const [properties, total] = await Promise.all([
            this.prisma.property.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    host: { select: { name: true, businessName: true } },
                    stays: { where: { deletedAt: null, isActive: true }, take: 1 },
                    experiences: { where: { deletedAt: null, isActive: true }, take: 1 },
                    transports: { where: { deletedAt: null, isActive: true }, take: 1 },
                    _count: { select: { bookings: true, reviews: true } },
                },
            }),
            this.prisma.property.count({ where }),
        ]);
        return {
            data: properties.map((p) => {
                const price = p.stays[0]?.price ??
                    p.experiences[0]?.price ??
                    p.transports[0]?.pricePerSeat ??
                    0;
                return {
                    id: p.id,
                    propertyId: p.id,
                    listingId: p.id,
                    type: p.type.toLowerCase(),
                    name: p.name,
                    hostName: p.host?.businessName || p.host?.name || null,
                    location: p.location,
                    price,
                    priceFormatted: `K${(price / 100).toFixed(2)}`,
                    status: p.status.toLowerCase(),
                    bookingsCount: p._count.bookings,
                    reviewsCount: p._count.reviews,
                    createdAt: p.createdAt,
                };
            }),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getListings(page = 1, limit = 20, status) {
        return this.getProperties(page, limit, status);
    }
    async updatePropertyStatus(propertyId, status, reason) {
        const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        const newStatus = status === 'approved' ? 'ACTIVE' : 'INACTIVE';
        const updated = await this.prisma.property.update({
            where: { id: propertyId },
            data: { status: newStatus },
        });
        await this.prisma.notification.create({
            data: {
                userId: property.hostId,
                type: status === 'approved' ? 'PROPERTY_APPROVED' : 'PROPERTY_REJECTED',
                title: status === 'approved' ? 'Property Approved' : 'Property Rejected',
                description: reason || `Your property "${property.name}" has been ${status}.`,
                actionUrl: '/host/properties',
            },
        });
        return {
            id: updated.id,
            status: updated.status.toLowerCase(),
            message: `Property ${status} successfully`,
        };
    }
    async updateListingStatus(listingId, status, reason) {
        return this.updatePropertyStatus(listingId, status, reason);
    }
    async getBookings(page = 1, limit = 20) {
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    property: { select: { name: true, type: true } },
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
                propertyName: b.property?.name || null,
                listingName: b.property?.name || null,
                propertyType: b.property?.type?.toLowerCase() || null,
                listingType: b.property?.type?.toLowerCase() || null,
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
    async updateDispute(disputeId, status, resolution) {
        const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } });
        if (!dispute)
            throw new common_1.NotFoundException('Dispute not found');
        const newStatus = status.toUpperCase();
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
    async getPayouts(page = 1, limit = 20, status) {
        const where = {};
        if (status)
            where.status = status.toUpperCase();
        const [payouts, total] = await Promise.all([
            this.prisma.payout.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { host: { select: { name: true, email: true } } },
            }),
            this.prisma.payout.count({ where }),
        ]);
        return {
            data: payouts.map((p) => ({
                id: p.id,
                hostName: p.host?.name || null,
                hostEmail: p.host?.email || null,
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
    async processPayouts(payoutIds) {
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
    async logActivity(data) {
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
    async getReports() {
        const [monthlyData, platformStats] = await Promise.all([
            this.prisma.$queryRaw `
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
    async getPlatformStats() {
        const [totalUsers, totalGuests, totalHosts, totalListings, activeListings, totalBookings, completedBookings, totalRevenue, pendingModerationListings,] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { role: 'GUEST', deletedAt: null } }),
            this.prisma.user.count({ where: { role: 'HOST', deletedAt: null } }),
            this.prisma.property.count({ where: { deletedAt: null } }),
            this.prisma.property.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
            this.prisma.booking.count(),
            this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
            this.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
            this.prisma.property.count({ where: { status: 'PENDING', deletedAt: null } }),
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
            growthRate: 23.5,
            pendingModeration: Number(pendingModerationListings),
            reportedListings: Number(reportedListings),
        };
    }
    async getSettings() {
        const settings = await this.prisma.setting.findMany({ orderBy: { category: 'asc' } });
        return { settings };
    }
    async updateSettings(updates) {
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
    async promoteToAdmin(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
            select: { id: true, name: true, email: true, role: true },
        });
    }
    async approveHost(hostId) {
        const user = await this.prisma.user.findUnique({ where: { id: hostId } });
        if (!user || user.role !== 'HOST')
            throw new common_1.NotFoundException('Host not found');
        const updated = await this.prisma.user.update({
            where: { id: hostId },
            data: { isApproved: true },
        });
        await this.prisma.notification.create({
            data: {
                userId: updated.id,
                type: 'SYSTEM',
                title: 'Host Account Approved',
                description: 'Your host account has been approved. You can now create properties.',
                actionUrl: '/host/properties',
            },
        });
        return updated;
    }
    async getHostApplications(status, page = 1, limit = 20) {
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = status ? { status } : {};
        const [items, total] = await Promise.all([
            this.prisma.hostApplication.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, phone: true, avatar: true },
                    },
                },
            }),
            this.prisma.hostApplication.count({ where }),
        ]);
        return {
            items,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / take),
        };
    }
    async reviewHostApplication(applicationId, dto) {
        const app = await this.prisma.hostApplication.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Host application not found');
        const isApproved = dto.decision === 'approved';
        const status = isApproved ? 'approved' : 'rejected';
        const updatedApp = await this.prisma.hostApplication.update({
            where: { id: applicationId },
            data: {
                status,
                reviewerNotes: dto.notes || null,
                reviewedAt: new Date(),
            },
        });
        if (isApproved) {
            await this.prisma.user.update({
                where: { id: app.userId },
                data: {
                    role: 'HOST',
                    isApproved: true,
                    businessName: app.businessName || app.user.businessName,
                },
            });
            await this.prisma.notification.create({
                data: {
                    userId: app.userId,
                    type: 'SYSTEM',
                    title: 'Host Application Approved!',
                    description: dto.notes ||
                        'Congratulations! Your host application has been approved. You can now access your host dashboard and list properties.',
                    actionUrl: '/host',
                },
            });
        }
        else {
            await this.prisma.notification.create({
                data: {
                    userId: app.userId,
                    type: 'SYSTEM',
                    title: 'Host Application Update',
                    description: dto.notes ||
                        'Your host application was not approved. Please review your documents or contact support.',
                    actionUrl: '/become-host',
                },
            });
        }
        return {
            applicationId: updatedApp.id,
            userId: updatedApp.userId,
            status: updatedApp.status,
            decision: dto.decision,
            reviewedAt: updatedApp.reviewedAt,
            reviewerNotes: updatedApp.reviewerNotes,
            message: isApproved
                ? 'Application approved and host role granted.'
                : 'Application rejected.',
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map