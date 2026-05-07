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
exports.HostDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HostDashboardService = class HostDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(hostId) {
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
        const upcomingBookings = bookings.filter((b) => b.checkIn && new Date(b.checkIn) > now).length;
        return {
            host: {
                id: host.id,
                userId: host.userId,
                displayName: `${host.user.firstName} ${host.user.lastName}`.trim(),
                businessName: host.businessName,
                verified: host.isApproved,
            },
            stats: {
                totalEarnings: Number(payments._sum.hostAmount ?? 0),
                activeListings: accommodations.length,
                upcomingBookings,
                averageRating: 0,
            },
            recentBookings: bookings,
            listings: accommodations,
        };
    }
    async getEarnings(hostId) {
        const payments = await this.prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                booking: { items: { some: { accommodation: { hostId } } } },
            },
            select: { hostAmount: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        const monthlyMap = new Map();
        for (const p of payments) {
            const key = p.createdAt.toISOString().substring(0, 7);
            monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(p.hostAmount));
        }
        return {
            total: payments.reduce((sum, p) => sum + Number(p.hostAmount), 0),
            monthly: Array.from(monthlyMap.entries())
                .map(([month, amount]) => ({ month, amount }))
                .sort((a, b) => b.month.localeCompare(a.month)),
        };
    }
    async getCalendar(hostId, listingId) {
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
    async getListings(hostId) {
        return this.prisma.accommodation.findMany({
            where: { hostId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.HostDashboardService = HostDashboardService;
exports.HostDashboardService = HostDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HostDashboardService);
//# sourceMappingURL=host-dashboard.service.js.map