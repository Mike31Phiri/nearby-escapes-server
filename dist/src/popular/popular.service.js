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
exports.PopularService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const LIMIT = 10;
let PopularService = class PopularService {
    prisma;
    config;
    zmwRate;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.zmwRate = Number(this.config.get('ZMW_RATE') ?? 18);
    }
    async getPopularAccommodations() {
        const popular = await this.prisma.popularAccommodation.findMany({
            orderBy: { bookingCount: 'desc' },
            take: LIMIT,
            include: {
                accommodation: {
                    include: { host: { include: { user: true } } },
                },
            },
        });
        const accs = popular.length
            ? popular.map((p) => p.accommodation)
            : await this.prisma.accommodation.findMany({
                take: LIMIT,
                orderBy: { createdAt: 'desc' },
                include: { host: { include: { user: true } } },
            });
        return Promise.all(accs.map((acc) => this.toStay(acc)));
    }
    async getPopularBuses() {
        const popular = await this.prisma.popularBus.findMany({
            orderBy: { bookingCount: 'desc' },
            take: LIMIT,
            include: { bus: true },
        });
        return popular.length
            ? popular.map((p) => this.toBus(p.bus))
            : (await this.prisma.bus.findMany({ take: LIMIT, orderBy: { createdAt: 'desc' } })).map(this.toBus);
    }
    async getPopularAttractions() {
        const popular = await this.prisma.popularAttraction.findMany({
            orderBy: { bookingCount: 'desc' },
            take: LIMIT,
            include: { attraction: true },
        });
        return popular.length
            ? popular.map((p) => this.toAttraction(p.attraction))
            : (await this.prisma.attraction.findMany({ take: LIMIT, orderBy: { createdAt: 'desc' } })).map(this.toAttraction);
    }
    async getPopularPackages() {
        const popular = await this.prisma.popularPackage.findMany({
            orderBy: { bookingCount: 'desc' },
            take: LIMIT,
            include: { package: true },
        });
        return popular.length
            ? popular.map((p) => this.toPackage(p.package))
            : (await this.prisma.package.findMany({ take: LIMIT, orderBy: { createdAt: 'desc' } })).map(this.toPackage);
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
            host: host ? {
                id: host.id,
                displayName: `${host.user.firstName} ${host.user.lastName}`.trim(),
                avatarUrl: host.user.avatarUrl ?? null,
                location: host.user.location ?? null,
                verified: host.isApproved,
            } : null,
        };
    }
    toBus(bus) {
        return {
            id: bus.id,
            name: bus.name,
            description: bus.description,
            route: bus.route,
            from: bus.route?.split(' - ')?.[0] ?? null,
            to: bus.route?.split(' - ')?.[1] ?? null,
            departureTime: bus.departureTime,
            arrivalTime: bus.arrivalTime,
            price: Number(bus.pricePerSeat),
            image: bus.photos?.[0] ?? null,
            images: bus.photos ?? [],
        };
    }
    toAttraction(attraction) {
        return {
            id: attraction.id,
            name: attraction.name,
            description: attraction.description,
            location: attraction.location,
            price: Number(attraction.pricePerPerson),
            image: attraction.photos?.[0] ?? null,
            images: attraction.photos ?? [],
            capacity: attraction.capacity,
            availableSlots: attraction.availableSlots,
        };
    }
    toPackage(pkg) {
        return {
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.totalPrice),
            image: pkg.photos?.[0] ?? null,
            images: pkg.photos ?? [],
        };
    }
    async syncPopular() {
        await Promise.all([
            this.syncAccommodations(),
            this.syncBuses(),
            this.syncAttractions(),
            this.syncPackages(),
        ]);
        return { message: 'Popular tables synced' };
    }
    async syncAccommodations() {
        const counts = await this.prisma.bookingItem.groupBy({
            by: ['accommodationId'],
            where: { accommodationId: { not: null } },
            _count: { _all: true },
            orderBy: { _count: { accommodationId: 'desc' } },
            take: LIMIT,
        });
        for (const item of counts) {
            await this.prisma.popularAccommodation.upsert({
                where: { accommodationId: item.accommodationId },
                update: { bookingCount: item._count._all },
                create: { accommodationId: item.accommodationId, bookingCount: item._count._all },
            });
        }
    }
    async syncBuses() {
        const counts = await this.prisma.bookingItem.groupBy({
            by: ['busId'],
            where: { busId: { not: null } },
            _count: { _all: true },
            orderBy: { _count: { busId: 'desc' } },
            take: LIMIT,
        });
        for (const item of counts) {
            await this.prisma.popularBus.upsert({
                where: { busId: item.busId },
                update: { bookingCount: item._count._all },
                create: { busId: item.busId, bookingCount: item._count._all },
            });
        }
    }
    async syncAttractions() {
        const counts = await this.prisma.bookingItem.groupBy({
            by: ['attractionId'],
            where: { attractionId: { not: null } },
            _count: { _all: true },
            orderBy: { _count: { attractionId: 'desc' } },
            take: LIMIT,
        });
        for (const item of counts) {
            await this.prisma.popularAttraction.upsert({
                where: { attractionId: item.attractionId },
                update: { bookingCount: item._count._all },
                create: { attractionId: item.attractionId, bookingCount: item._count._all },
            });
        }
    }
    async syncPackages() {
        const counts = await this.prisma.bookingItem.groupBy({
            by: ['packageId'],
            where: { packageId: { not: null } },
            _count: { _all: true },
            orderBy: { _count: { packageId: 'desc' } },
            take: LIMIT,
        });
        for (const item of counts) {
            await this.prisma.popularPackage.upsert({
                where: { packageId: item.packageId },
                update: { bookingCount: item._count._all },
                create: { packageId: item.packageId, bookingCount: item._count._all },
            });
        }
    }
};
exports.PopularService = PopularService;
exports.PopularService = PopularService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], PopularService);
//# sourceMappingURL=popular.service.js.map