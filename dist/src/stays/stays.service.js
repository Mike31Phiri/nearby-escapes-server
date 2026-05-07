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
exports.StaysService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let StaysService = class StaysService {
    prisma;
    config;
    zmwRate;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.zmwRate = Number(this.config.get('ZMW_RATE') ?? 18);
    }
    async findAll(q, location, minPrice, maxPrice) {
        const where = {};
        if (location)
            where.location = { contains: location, mode: 'insensitive' };
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.pricePerNight = {};
            if (minPrice !== undefined)
                where.pricePerNight.gte = minPrice;
            if (maxPrice !== undefined)
                where.pricePerNight.lte = maxPrice;
        }
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
            ];
        }
        const accommodations = await this.prisma.accommodation.findMany({
            where,
            include: {
                host: { include: { user: true } },
                _count: { select: { bookingItems: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(accommodations.map((acc) => this.toStay(acc)));
    }
    async findOne(id) {
        const acc = await this.prisma.accommodation.findUnique({
            where: { id },
            include: {
                host: { include: { user: true } },
                _count: { select: { bookingItems: true } },
            },
        });
        if (!acc)
            throw new common_1.NotFoundException('Stay not found');
        return this.toStay(acc);
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
            images: acc.photos?.length ? acc.photos : (acc.photos?.[0] ? [acc.photos[0]] : []),
            category: acc.category ? acc.category.charAt(0) + acc.category.slice(1).toLowerCase() : null,
            description: acc.description,
            amenities: acc.amenities ?? [],
            maxGuests: acc.maxGuests,
            availableRooms: acc.availableRooms,
            totalRooms: acc.totalRooms,
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
exports.StaysService = StaysService;
exports.StaysService = StaysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], StaysService);
//# sourceMappingURL=stays.service.js.map