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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [totalUsers, totalHosts, totalBookings, totalPayments, pendingPayouts,] = await Promise.all([
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
            this.prisma.$queryRaw `
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
            this.prisma.$queryRaw `
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
    async getPayouts(onlyPending) {
        return this.prisma.payout.findMany({
            where: onlyPending ? { isPaid: false } : {},
            include: { host: { select: { businessName: true, user: { select: { email: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markPayoutPaid(payoutId) {
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
    async promoteToAdmin(userId, requesterId) {
        const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester || requester.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can promote other admins');
        }
        const target = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        if (target.role === 'ADMIN')
            throw new common_1.BadRequestException('User is already an admin');
        return this.prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
        });
    }
    async approveHost(hostId) {
        return this.prisma.host.update({
            where: { id: hostId },
            data: { isApproved: true },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map