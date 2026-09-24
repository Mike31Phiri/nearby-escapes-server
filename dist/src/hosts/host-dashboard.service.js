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
    async getDashboard(userId) {
        const host = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, avatar: true, businessName: true },
        });
        if (!host)
            return {
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
                thumbnailUrl: b.property?.images?.[0]?.url || null,
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
                propertyName: r.property?.name || null,
                listingName: r.property?.name || null,
                guestName: r.guest?.name || null,
                rating: r.rating,
                text: r.text,
                createdAt: r.createdAt,
            })),
            earningsByMonth: [],
        };
    }
    async getEarnings(userId) {
        const payments = await this.prisma.payment.findMany({
            where: { status: 'PAID', booking: { hostId: userId } },
            select: { hostAmount: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        const monthlyMap = new Map();
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
    async getProperties(userId) {
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
                location: p.location,
                thumbnailUrl: p.images?.[0]?.url || null,
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
    async getListings(userId) {
        return this.getProperties(userId);
    }
};
exports.HostDashboardService = HostDashboardService;
exports.HostDashboardService = HostDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HostDashboardService);
//# sourceMappingURL=host-dashboard.service.js.map