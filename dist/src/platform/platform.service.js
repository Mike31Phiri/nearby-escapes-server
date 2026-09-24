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
var PlatformService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PlatformService = PlatformService_1 = class PlatformService {
    prisma;
    logger = new common_1.Logger(PlatformService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkHealth() {
        return this.getHealth();
    }
    async getHealth() {
        let dbStatus = 'ok';
        let dbLatencyMs = 0;
        try {
            const start = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            dbLatencyMs = Date.now() - start;
        }
        catch {
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
        return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    }
    async getBootstrap() {
        const [userCount, hostCount, guestCount, propertyCount, activePropertyCount, bookingCount, completedBookingCount, avgRatingResult, reviewCount, paymentAgg, gems, locations, settings,] = await Promise.all([
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
            this.prisma.property.findMany({
                where: { deletedAt: null, status: 'ACTIVE', reviews: { some: { rating: { gte: 4 } } } },
                include: {
                    host: { select: { name: true, avatar: true, businessName: true } },
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
            this.prisma.property.findMany({
                where: { deletedAt: null, status: 'ACTIVE' },
                select: { location: true },
                distinct: ['location'],
                take: 20,
            }),
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
                        currency: p.currency,
                        rating: p.reviews?.length
                            ? Number((p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length).toFixed(1))
                            : 0,
                        reviewCount: p._count?.reviews || 0,
                        hostName: p.host?.businessName || p.host?.name || null,
                    };
                }),
            },
            locations: [...new Set(locations.map((l) => l.location))].slice(0, 20),
            settings: settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
        };
    }
    async getUserBootstrap(userId) {
        const [unreadNotifications, wishlist, hostStatus, recentBookings, user] = await Promise.all([
            this.prisma.notification.count({ where: { userId, isRead: false } }),
            this.prisma.wishlist.findUnique({
                where: { userId },
                select: { _count: { select: { items: true } } },
            }),
            this.prisma.user.findUnique({ where: { id: userId, role: 'HOST' }, select: { id: true, businessName: true, isApproved: true } }),
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
                    hasProfile: true,
                    isApproved: hostStatus.isApproved,
                    hostId: hostStatus.id,
                    businessName: hostStatus.businessName,
                    role: hostStatus.isApproved ? 'host' : 'host_pending',
                }
                : {
                    hasProfile: false,
                    isApproved: false,
                    hostId: null,
                    businessName: null,
                    role: 'guest',
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
                thumbnailUrl: b.property?.images?.[0]?.url || null,
                createdAt: b.createdAt,
            })),
        };
    }
};
exports.PlatformService = PlatformService;
exports.PlatformService = PlatformService = PlatformService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlatformService);
//# sourceMappingURL=platform.service.js.map