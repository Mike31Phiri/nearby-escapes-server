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
var ListingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ListingsService = ListingsService_1 = class ListingsService {
    prisma;
    logger = new common_1.Logger(ListingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            status: 'ACTIVE',
        };
        if (query.type && query.type !== 'all') {
            where.type = query.type.toUpperCase();
        }
        if (query.location) {
            where.location = { contains: query.location, mode: 'insensitive' };
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined)
                where.price.gte = query.minPrice;
            if (query.maxPrice !== undefined)
                where.price.lte = query.maxPrice;
        }
        if (query.featured === 'gem') {
            where.reviews = {
                some: { rating: { gte: 4 } },
            };
        }
        let orderBy = { createdAt: 'desc' };
        if (query.sort === 'price_asc')
            orderBy = { price: 'asc' };
        else if (query.sort === 'price_desc')
            orderBy = { price: 'desc' };
        else if (query.sort === 'newest')
            orderBy = { createdAt: 'desc' };
        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                include: {
                    host: { include: { user: { select: { name: true, avatar: true } } } },
                    reviews: { select: { rating: true } },
                    _count: { select: { reviews: true, bookings: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.listing.count({ where }),
        ]);
        return {
            data: listings.map((l) => this.formatListing(l)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findStay(id) {
        return this.findOneByType(id, 'STAY');
    }
    async findExperience(id) {
        return this.findOneByType(id, 'EXPERIENCE');
    }
    async findTransport(id) {
        return this.findOneByType(id, 'TRANSPORT');
    }
    async findOneByType(id, type) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: {
                host: { include: { user: { select: { name: true, avatar: true } } } },
                reviews: { include: { guest: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
                _count: { select: { reviews: true, bookings: true } },
            },
        });
        if (!listing || listing.deletedAt)
            throw new common_1.NotFoundException('Listing not found');
        if (listing.type !== type)
            throw new common_1.NotFoundException(`Listing is not a ${type.toLowerCase()}`);
        return this.formatListing(listing);
    }
    async createStay(hostId, dto) {
        const listing = await this.prisma.listing.create({
            data: {
                hostId,
                type: 'STAY',
                name: dto.name,
                description: dto.description,
                location: dto.location,
                images: dto.images || [],
                price: dto.pricePerNight,
                propertyType: dto.propertyType,
                bedrooms: dto.bedrooms,
                beds: dto.beds,
                baths: dto.baths,
                maxGuests: dto.maxGuests,
                amenities: dto.amenities || [],
                checkInFrom: dto.checkInFrom,
                checkInUntil: dto.checkInUntil,
                checkOutBefore: dto.checkOutBefore,
                houseRules: dto.houseRules || [],
                cancellationPolicy: dto.cancellationPolicy,
            },
            include: { host: { include: { user: { select: { name: true, avatar: true } } } } },
        });
        return this.formatListing(listing);
    }
    async createExperience(hostId, dto) {
        const listing = await this.prisma.listing.create({
            data: {
                hostId,
                type: 'EXPERIENCE',
                name: dto.name,
                description: dto.description,
                location: dto.location,
                images: dto.images || [],
                price: dto.pricePerPerson,
                activityType: dto.activityType,
                duration: dto.duration,
                maxParticipants: dto.maxParticipants,
                difficultyLevel: dto.difficultyLevel,
                whatsIncluded: dto.whatsIncluded || [],
                meetingPoint: dto.meetingPoint,
                timeSlots: dto.timeSlots || [],
                pricePerPerson: dto.pricePerPerson,
            },
            include: { host: { include: { user: { select: { name: true, avatar: true } } } } },
        });
        return this.formatListing(listing);
    }
    async createTransport(hostId, dto) {
        const listing = await this.prisma.listing.create({
            data: {
                hostId,
                type: 'TRANSPORT',
                name: dto.name,
                description: dto.description,
                location: `${dto.from} → ${dto.to}`,
                price: dto.pricePerSeat,
                images: dto.images || [],
                from: dto.from,
                to: dto.to,
                vehicleType: dto.vehicleType,
                capacity: dto.capacity,
                pricePerSeat: dto.pricePerSeat,
                schedule: dto.schedule ? JSON.parse(JSON.stringify(dto.schedule)) : undefined,
            },
            include: { host: { include: { user: { select: { name: true, avatar: true } } } } },
        });
        return this.formatListing(listing);
    }
    async update(id, hostId, dto) {
        const listing = await this.assertOwnership(id, hostId);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.location !== undefined)
            data.location = dto.location;
        if (dto.images !== undefined)
            data.images = dto.images;
        if (dto.price !== undefined)
            data.price = dto.price;
        if (dto.status !== undefined)
            data.status = dto.status.toUpperCase();
        const updated = await this.prisma.listing.update({
            where: { id },
            data,
            include: { host: { include: { user: { select: { name: true, avatar: true } } } } },
        });
        return this.formatListing(updated);
    }
    async remove(id, hostId) {
        await this.assertOwnership(id, hostId);
        return this.prisma.listing.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' },
        });
    }
    async findByHost(hostId) {
        const listings = await this.prisma.listing.findMany({
            where: { hostId, deletedAt: null },
            include: {
                host: { include: { user: { select: { name: true, avatar: true } } } },
                reviews: { select: { rating: true } },
                _count: { select: { reviews: true, bookings: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return listings.map((l) => this.formatListing(l));
    }
    async addImages(id, hostId, imageUrls) {
        await this.assertOwnership(id, hostId);
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        const updated = await this.prisma.listing.update({
            where: { id },
            data: { images: [...(listing?.images || []), ...imageUrls] },
        });
        return { images: updated.images };
    }
    async removeImage(id, hostId, imageUrl) {
        await this.assertOwnership(id, hostId);
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        const images = (listing?.images || []).filter((img) => img !== imageUrl);
        await this.prisma.listing.update({ where: { id }, data: { images } });
        return { images };
    }
    async getCurated(type) {
        const where = { deletedAt: null, status: 'ACTIVE' };
        if (type === 'packages') {
            where.type = 'EXPERIENCE';
        }
        else if (type === 'gems') {
            where.reviews = { some: { rating: { gte: 4 } } };
        }
        const listings = await this.prisma.listing.findMany({
            where,
            include: {
                host: { include: { user: { select: { name: true, avatar: true } } } },
                reviews: { select: { rating: true } },
                _count: { select: { reviews: true, bookings: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return {
            data: listings.map((l) => this.formatListing(l)),
            meta: { page: 1, limit: 20, total: listings.length, totalPages: 1 },
        };
    }
    formatListing(listing) {
        const host = listing.host;
        const ratings = listing.reviews?.map((r) => r.rating) || [];
        const avgRating = ratings.length
            ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 0;
        const base = {
            id: listing.id,
            type: listing.type.toLowerCase(),
            name: listing.name,
            description: listing.description,
            location: listing.location,
            images: listing.images || [],
            price: listing.price,
            currency: listing.currency,
            rating: avgRating,
            reviewCount: listing._count?.reviews || ratings.length,
            hostId: listing.hostId,
            hostName: host?.user?.name || null,
            status: listing.status.toLowerCase(),
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
        };
        if (listing.type === 'STAY') {
            return {
                ...base,
                bedrooms: listing.bedrooms,
                beds: listing.beds,
                baths: listing.baths,
                maxGuests: listing.maxGuests,
                amenities: listing.amenities || [],
                checkInFrom: listing.checkInFrom,
                checkInUntil: listing.checkInUntil,
                checkOutBefore: listing.checkOutBefore,
                houseRules: listing.houseRules || [],
                cancellationPolicy: listing.cancellationPolicy?.toLowerCase() || 'moderate',
            };
        }
        if (listing.type === 'EXPERIENCE') {
            return {
                ...base,
                activityType: listing.activityType,
                duration: listing.duration,
                maxParticipants: listing.maxParticipants,
                difficultyLevel: listing.difficultyLevel,
                whatsIncluded: listing.whatsIncluded || [],
                meetingPoint: listing.meetingPoint,
                timeSlots: listing.timeSlots || [],
            };
        }
        if (listing.type === 'TRANSPORT') {
            return {
                ...base,
                from: listing.from,
                to: listing.to,
                vehicleType: listing.vehicleType,
                capacity: listing.capacity,
                pricePerSeat: listing.pricePerSeat,
                schedule: listing.schedule,
            };
        }
        return base;
    }
    async assertOwnership(id, hostId) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (listing.hostId !== hostId)
            throw new common_1.NotFoundException('Listing not found');
        return listing;
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = ListingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map