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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PopularityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopularityService = exports.POPULAR_METADATA_KEY = exports.POPULAR_EXPERIENCES_KEY = exports.POPULAR_STAYS_KEY = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const ioredis_1 = __importDefault(require("ioredis"));
const prisma_service_1 = require("../prisma/prisma.service");
exports.POPULAR_STAYS_KEY = 'popular:stays';
exports.POPULAR_EXPERIENCES_KEY = 'popular:experiences';
exports.POPULAR_METADATA_KEY = 'popular:metadata';
const CACHE_TTL_SECONDS = 60 * 60 * 48;
let PopularityService = PopularityService_1 = class PopularityService {
    prisma;
    config;
    logger = new common_1.Logger(PopularityService_1.name);
    redis;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.redis = new ioredis_1.default({
            host: this.config.get('REDIS_HOST') || 'localhost',
            port: this.config.get('REDIS_PORT') || 6379,
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy: () => null,
        });
        this.redis.on('error', (err) => {
            this.logger.warn(`Redis connection warning (PopularityService): ${err.message}`);
        });
    }
    async onApplicationBootstrap() {
        try {
            await this.redis.connect().catch(() => { });
            const hasStays = await this.redis.exists(exports.POPULAR_STAYS_KEY);
            const hasExp = await this.redis.exists(exports.POPULAR_EXPERIENCES_KEY);
            if (!hasStays || !hasExp) {
                this.logger.log('Initial popular listings cache missing or incomplete. Priming now...');
                await this.recalculateAll();
            }
            else {
                this.logger.log('Popular listings cache primed and ready in Redis.');
            }
        }
        catch (err) {
            this.logger.warn(`Could not verify or prime Redis popular listings on startup: ${err.message}`);
        }
    }
    async onModuleDestroy() {
        try {
            await this.redis.quit();
        }
        catch { }
    }
    async handleMidnightRecalculation() {
        this.logger.log('⏰ Starting 24h midnight popularity calculator...');
        try {
            await this.recalculateAll();
            this.logger.log('✅ Midnight popularity recalculation finished successfully.');
        }
        catch (err) {
            this.logger.error(`❌ Midnight popularity recalculation failed: ${err.message}`, err.stack);
        }
    }
    async recalculateAll() {
        const [stays, experiences] = await Promise.all([
            this.calculateAndStorePopular('STAY', 10),
            this.calculateAndStorePopular('EXPERIENCE', 10),
        ]);
        const timestamp = new Date().toISOString();
        try {
            await this.redis.set(exports.POPULAR_METADATA_KEY, JSON.stringify({
                lastCalculated: timestamp,
                stayCount: stays.length,
                experienceCount: experiences.length,
            }), 'EX', CACHE_TTL_SECONDS);
        }
        catch (err) {
            this.logger.warn(`Failed to cache popularity metadata: ${err.message}`);
        }
        return {
            stays: stays.length,
            experiences: experiences.length,
            timestamp,
        };
    }
    async calculateAndStorePopular(type, limit = 10) {
        const key = type === 'STAY' ? exports.POPULAR_STAYS_KEY : exports.POPULAR_EXPERIENCES_KEY;
        const bookingCounts = await this.prisma.booking.groupBy({
            by: ['propertyId'],
            where: {
                property: {
                    type,
                    deletedAt: null,
                    status: 'ACTIVE',
                },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: limit,
        });
        const bookingMap = new Map();
        const orderedIds = [];
        for (const b of bookingCounts) {
            bookingMap.set(b.propertyId, b._count.id);
            orderedIds.push(b.propertyId);
        }
        if (orderedIds.length < limit) {
            const needed = limit - orderedIds.length;
            const additional = await this.prisma.property.findMany({
                where: {
                    type,
                    deletedAt: null,
                    status: 'ACTIVE',
                    ...(orderedIds.length ? { id: { notIn: orderedIds } } : {}),
                },
                take: needed,
                orderBy: [
                    { reviews: { _count: 'desc' } },
                    { createdAt: 'desc' },
                ],
                select: { id: true },
            });
            for (const item of additional) {
                bookingMap.set(item.id, 0);
                orderedIds.push(item.id);
            }
        }
        if (!orderedIds.length) {
            try {
                await this.redis.set(key, JSON.stringify([]), 'EX', CACHE_TTL_SECONDS);
            }
            catch { }
            return [];
        }
        const properties = await this.prisma.property.findMany({
            where: { id: { in: orderedIds } },
            include: {
                host: { select: { id: true, name: true, avatar: true, businessName: true } },
                stays: {
                    where: { deletedAt: null },
                    orderBy: { sortOrder: 'asc' },
                    include: { policies: { orderBy: { sortOrder: 'asc' } } },
                },
                experiences: {
                    where: { deletedAt: null },
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        timeSlots: { orderBy: { slot: 'asc' } },
                        inclusions: true,
                        policies: { orderBy: { sortOrder: 'asc' } },
                    },
                },
                images: { orderBy: { sortOrder: 'asc' } },
                amenities: { orderBy: { name: 'asc' } },
                rules: true,
                reviews: { select: { rating: true } },
                _count: { select: { reviews: true, bookings: true } },
            },
        });
        const propertyMap = new Map();
        for (const p of properties) {
            propertyMap.set(p.id, p);
        }
        const formatted = [];
        let rank = 1;
        for (const id of orderedIds) {
            const p = propertyMap.get(id);
            if (!p)
                continue;
            const doc = this.formatListingDoc(p);
            const bookingCount = bookingMap.get(id) ?? p._count?.bookings ?? 0;
            formatted.push({
                ...doc,
                popularRank: rank++,
                bookingCount,
            });
        }
        try {
            await this.redis.set(key, JSON.stringify(formatted), 'EX', CACHE_TTL_SECONDS);
            this.logger.log(`Stored ${formatted.length} popular ${type.toLowerCase()}s in Redis at key "${key}"`);
        }
        catch (err) {
            this.logger.warn(`Failed to store popular ${type.toLowerCase()}s in Redis: ${err.message}`);
        }
        return formatted;
    }
    async getPopularStays() {
        try {
            const cached = await this.redis.get(exports.POPULAR_STAYS_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (err) {
            this.logger.warn(`Redis get "${exports.POPULAR_STAYS_KEY}" failed: ${err.message}`);
        }
        return this.calculateAndStorePopular('STAY', 10);
    }
    async getPopularExperiences() {
        try {
            const cached = await this.redis.get(exports.POPULAR_EXPERIENCES_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (err) {
            this.logger.warn(`Redis get "${exports.POPULAR_EXPERIENCES_KEY}" failed: ${err.message}`);
        }
        return this.calculateAndStorePopular('EXPERIENCE', 10);
    }
    async getMetadata() {
        try {
            const cached = await this.redis.get(exports.POPULAR_METADATA_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch { }
        return {
            lastCalculated: null,
            cronSchedule: '0 0 * * * (Midnight UTC)',
            frequency: 'Every 24 hours',
            keys: {
                stays: exports.POPULAR_STAYS_KEY,
                experiences: exports.POPULAR_EXPERIENCES_KEY,
            },
        };
    }
    formatListingDoc(property) {
        const ratings = property.reviews?.map((r) => r.rating) || [];
        const avgRating = ratings.length
            ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 0;
        let startingPrice = 0;
        if (property.type === 'STAY' && property.stays?.length) {
            const active = property.stays.filter((s) => s.isActive);
            if (active.length)
                startingPrice = Math.min(...active.map((s) => s.price));
        }
        else if (property.type === 'EXPERIENCE' && property.experiences?.length) {
            const active = property.experiences.filter((e) => e.isActive);
            if (active.length)
                startingPrice = Math.min(...active.map((e) => e.price));
        }
        return {
            id: property.id,
            type: property.type.toLowerCase(),
            status: property.status.toLowerCase(),
            name: property.name,
            description: property.description,
            location: property.location,
            currency: property.currency,
            price: startingPrice,
            priceFormatted: `K${(startingPrice / 100).toFixed(2)}`,
            rating: avgRating,
            reviewCount: property._count?.reviews ?? ratings.length,
            thumbnailUrl: property.images?.[0]?.url || null,
            images: (property.images || []).map((img) => ({ url: img.url, sortOrder: img.sortOrder })),
            amenities: (property.amenities || []).map((a) => ({ name: a.name, icon: a.icon })),
            rules: (property.rules || []).map((r) => r.rule),
            hostId: property.hostId,
            hostName: property.host?.businessName || property.host?.name || null,
            hostAvatar: property.host?.avatar || null,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
            stays: (property.stays || []).map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                price: s.price,
                priceFormatted: `K${(s.price / 100).toFixed(2)}`,
                roomType: s.roomType,
                bedrooms: s.bedrooms,
                beds: s.beds,
                baths: s.baths,
                maxGuests: s.maxGuests,
                checkInFrom: s.checkInFrom,
                checkInUntil: s.checkInUntil,
                checkOutBefore: s.checkOutBefore,
                cancellationPolicy: s.cancellationPolicy?.toLowerCase() || null,
                isActive: s.isActive,
                policies: s.policies || [],
            })),
            experiences: (property.experiences || []).map((e) => ({
                id: e.id,
                name: e.name,
                description: e.description,
                price: e.price,
                priceFormatted: `K${(e.price / 100).toFixed(2)}`,
                activityType: e.activityType,
                duration: e.duration,
                maxParticipants: e.maxParticipants,
                difficultyLevel: e.difficultyLevel,
                meetingPoint: e.meetingPoint,
                isActive: e.isActive,
                timeSlots: (e.timeSlots || []).map((ts) => ts.slot),
                inclusions: (e.inclusions || []).map((i) => i.item),
                policies: e.policies || [],
            })),
        };
    }
};
exports.PopularityService = PopularityService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * *', {
        name: 'calculate-popular-listings',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PopularityService.prototype, "handleMidnightRecalculation", null);
exports.PopularityService = PopularityService = PopularityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PopularityService);
//# sourceMappingURL=popularity.service.js.map