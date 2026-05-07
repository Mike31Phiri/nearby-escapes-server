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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const TAKE = 8;
let RecommendationsService = class RecommendationsService {
    prisma;
    config;
    zmwRate;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.zmwRate = Number(this.config.get('ZMW_RATE') ?? 18);
    }
    async getRecommendations(userId, locationOverride) {
        if (locationOverride) {
            const stays = await this.prisma.accommodation.findMany({
                where: {
                    availableRooms: { gt: 0 },
                    location: { contains: locationOverride.trim(), mode: 'insensitive' },
                },
                include: { host: { include: { user: true } } },
                orderBy: { createdAt: 'desc' },
                take: TAKE,
            });
            if (stays.length)
                return Promise.all(stays.map((s) => this.toStay(s)));
        }
        const recentBookings = await this.prisma.booking.findMany({
            where: { userId, status: 'APPROVED' },
            include: {
                items: { include: { accommodation: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        const bookedAccommodationIds = recentBookings
            .flatMap((b) => b.items.map((i) => i.accommodationId))
            .filter(Boolean);
        const bookedLocations = [
            ...new Set(recentBookings
                .flatMap((b) => b.items.map((i) => i.accommodation?.location))
                .filter(Boolean)),
        ];
        if (bookedLocations.length) {
            const stays = await this.prisma.accommodation.findMany({
                where: {
                    id: { notIn: bookedAccommodationIds },
                    availableRooms: { gt: 0 },
                    OR: bookedLocations.map((loc) => ({
                        location: { contains: loc.split(',')[0].trim(), mode: 'insensitive' },
                    })),
                },
                include: { host: { include: { user: true } } },
                orderBy: { createdAt: 'desc' },
                take: TAKE,
            });
            if (stays.length)
                return Promise.all(stays.map((s) => this.toStay(s)));
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user?.location) {
            const locationCity = user.location.split(',')[0].trim();
            const stays = await this.prisma.accommodation.findMany({
                where: {
                    availableRooms: { gt: 0 },
                    location: { contains: locationCity, mode: 'insensitive' },
                },
                include: { host: { include: { user: true } } },
                orderBy: { createdAt: 'desc' },
                take: TAKE,
            });
            if (stays.length)
                return Promise.all(stays.map((s) => this.toStay(s)));
        }
        const featured = await this.prisma.accommodation.findMany({
            where: { availableRooms: { gt: 0 } },
            include: { host: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
            take: TAKE,
        });
        return Promise.all(featured.map((s) => this.toStay(s)));
    }
    async toStay(acc) {
        const feedbacks = await this.prisma.feedback.aggregate({
            where: { stayId: acc.id },
            _avg: { rating: true },
            _count: { rating: true },
        });
        const price = Number(acc.pricePerNight);
        const host = acc.host;
        return {
            id: acc.id,
            name: acc.name,
            location: acc.location,
            price,
            priceZmw: Math.round(price * this.zmwRate),
            rating: Number((feedbacks._avg.rating ?? 0).toFixed(1)),
            reviews: feedbacks._count.rating,
            image: acc.photos?.[0] ?? null,
            images: acc.photos?.length ? acc.photos : [],
            category: acc.category ? acc.category.charAt(0) + acc.category.slice(1).toLowerCase() : null,
            description: acc.description,
            amenities: acc.amenities ?? [],
            maxGuests: acc.maxGuests,
            availableRooms: acc.availableRooms,
            cancellationPolicy: acc.cancellationPolicy,
            host: host ? {
                id: host.id,
                displayName: `${host.user.firstName} ${host.user.lastName}`.trim(),
                avatarUrl: host.user.avatarUrl ?? null,
                location: host.user.location ?? null,
                verified: host.isApproved,
            } : null,
        };
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map