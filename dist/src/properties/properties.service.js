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
var PropertiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsService = exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PropertiesService = PropertiesService_1 = class PropertiesService {
    prisma;
    logger = new common_1.Logger(PropertiesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    fullInclude = {
        host: { select: { id: true, name: true, avatar: true, businessName: true } },
        stays: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
        },
        experiences: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            include: {
                timeSlots: { orderBy: { slot: 'asc' } },
                inclusions: true,
            },
        },
        transports: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: { orderBy: { name: 'asc' } },
        rules: true,
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, bookings: true } },
    };
    async createProperty(hostId, dto) {
        const property = await this.prisma.property.create({
            data: {
                hostId,
                type: dto.type,
                name: dto.name,
                description: dto.description,
                location: dto.location,
                currency: dto.currency || 'ZMW',
                images: dto.images?.length
                    ? { createMany: { data: dto.images.map((url, i) => ({ url, sortOrder: i })) } }
                    : undefined,
                amenities: dto.amenities?.length
                    ? { createMany: { data: dto.amenities.map((name) => ({ name })) } }
                    : undefined,
                rules: dto.rules?.length
                    ? { createMany: { data: dto.rules.map((rule) => ({ rule })) } }
                    : undefined,
            },
            include: this.fullInclude,
        });
        return this.formatProperty(property);
    }
    async update(id, hostId, dto) {
        await this.assertOwnership(id, hostId);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.location !== undefined)
            data.location = dto.location;
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.currency !== undefined)
            data.currency = dto.currency;
        const updated = await this.prisma.property.update({
            where: { id },
            data,
            include: this.fullInclude,
        });
        return this.formatProperty(updated);
    }
    async remove(id, hostId) {
        await this.assertOwnership(id, hostId);
        await this.prisma.property.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' },
        });
        return { id, deleted: true };
    }
    async addStay(propertyId, hostId, dto) {
        const property = await this.assertOwnership(propertyId, hostId);
        if (property.type !== 'STAY') {
            throw new common_1.BadRequestException('Cannot add a stay unit to a non-stay property');
        }
        const stay = await this.prisma.stay.create({
            data: {
                propertyId,
                name: dto.name,
                description: dto.description || null,
                price: dto.price,
                roomType: dto.roomType || null,
                bedrooms: dto.bedrooms ?? null,
                beds: dto.beds ?? null,
                baths: dto.baths ?? null,
                maxGuests: dto.maxGuests ?? null,
                checkInFrom: dto.checkInFrom || property.host?.defaultCheckInTime || '14:00',
                checkInUntil: dto.checkInUntil || null,
                checkOutBefore: dto.checkOutBefore || property.host?.defaultCheckOutTime || '10:00',
                cancellationPolicy: dto.cancellationPolicy || null,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
        return { propertyId, stay };
    }
    async listStays(propertyId) {
        return this.prisma.stay.findMany({
            where: { propertyId, deletedAt: null },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async updateStay(propertyId, stayId, hostId, dto) {
        await this.assertOwnership(propertyId, hostId);
        const stay = await this.prisma.stay.findFirst({ where: { id: stayId, propertyId } });
        if (!stay)
            throw new common_1.NotFoundException('Stay unit not found');
        const updated = await this.prisma.stay.update({
            where: { id: stayId },
            data: dto,
        });
        return { propertyId, stay: updated };
    }
    async removeStay(propertyId, stayId, hostId) {
        await this.assertOwnership(propertyId, hostId);
        await this.prisma.stay.update({
            where: { id: stayId },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { propertyId, stayId, deleted: true };
    }
    async addExperience(propertyId, hostId, dto) {
        const property = await this.assertOwnership(propertyId, hostId);
        if (property.type !== 'EXPERIENCE') {
            throw new common_1.BadRequestException('Cannot add an experience unit to a non-experience property');
        }
        const exp = await this.prisma.experience.create({
            data: {
                propertyId,
                name: dto.name,
                description: dto.description || null,
                price: dto.price,
                activityType: dto.activityType || null,
                duration: dto.duration || null,
                maxParticipants: dto.maxParticipants ?? null,
                difficultyLevel: dto.difficultyLevel || null,
                meetingPoint: dto.meetingPoint || null,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
                timeSlots: dto.timeSlots?.length
                    ? { createMany: { data: dto.timeSlots.map((slot) => ({ slot })) } }
                    : undefined,
                inclusions: dto.inclusions?.length
                    ? { createMany: { data: dto.inclusions.map((item) => ({ item })) } }
                    : undefined,
            },
            include: {
                timeSlots: { orderBy: { slot: 'asc' } },
                inclusions: true,
            },
        });
        return { propertyId, experience: exp };
    }
    async listExperiences(propertyId) {
        return this.prisma.experience.findMany({
            where: { propertyId, deletedAt: null },
            include: {
                timeSlots: { orderBy: { slot: 'asc' } },
                inclusions: true,
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async updateExperience(propertyId, experienceId, hostId, dto) {
        await this.assertOwnership(propertyId, hostId);
        const exp = await this.prisma.experience.findFirst({ where: { id: experienceId, propertyId } });
        if (!exp)
            throw new common_1.NotFoundException('Experience unit not found');
        const { timeSlots, inclusions, ...data } = dto;
        const updated = await this.prisma.$transaction(async (tx) => {
            if (timeSlots) {
                await tx.experienceTimeSlot.deleteMany({ where: { experienceId } });
                if (timeSlots.length) {
                    await tx.experienceTimeSlot.createMany({
                        data: timeSlots.map((slot) => ({ experienceId, slot })),
                    });
                }
            }
            if (inclusions) {
                await tx.experienceInclusion.deleteMany({ where: { experienceId } });
                if (inclusions.length) {
                    await tx.experienceInclusion.createMany({
                        data: inclusions.map((item) => ({ experienceId, item })),
                    });
                }
            }
            return tx.experience.update({
                where: { id: experienceId },
                data,
                include: {
                    timeSlots: { orderBy: { slot: 'asc' } },
                    inclusions: true,
                },
            });
        });
        return { propertyId, experience: updated };
    }
    async removeExperience(propertyId, experienceId, hostId) {
        await this.assertOwnership(propertyId, hostId);
        await this.prisma.experience.update({
            where: { id: experienceId },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { propertyId, experienceId, deleted: true };
    }
    async addTransport(propertyId, hostId, dto) {
        const property = await this.assertOwnership(propertyId, hostId);
        if (property.type !== 'TRANSPORT') {
            throw new common_1.BadRequestException('Cannot add a transport unit to a non-transport property');
        }
        const transport = await this.prisma.transport.create({
            data: {
                propertyId,
                name: dto.name,
                description: dto.description || null,
                from: dto.from || null,
                to: dto.to || null,
                vehicleType: dto.vehicleType || null,
                capacity: dto.capacity ?? null,
                pricePerSeat: dto.pricePerSeat ?? null,
                schedule: dto.schedule ? JSON.parse(JSON.stringify(dto.schedule)) : null,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
        return { propertyId, transport };
    }
    async listTransports(propertyId) {
        return this.prisma.transport.findMany({
            where: { propertyId, deletedAt: null },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async updateTransport(propertyId, transportId, hostId, dto) {
        await this.assertOwnership(propertyId, hostId);
        const transport = await this.prisma.transport.findFirst({ where: { id: transportId, propertyId } });
        if (!transport)
            throw new common_1.NotFoundException('Transport unit not found');
        const updated = await this.prisma.transport.update({
            where: { id: transportId },
            data: {
                ...dto,
                schedule: dto.schedule ? JSON.parse(JSON.stringify(dto.schedule)) : undefined,
            },
        });
        return { propertyId, transport: updated };
    }
    async removeTransport(propertyId, transportId, hostId) {
        await this.assertOwnership(propertyId, hostId);
        await this.prisma.transport.update({
            where: { id: transportId },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { propertyId, transportId, deleted: true };
    }
    async addImages(id, hostId, imageUrls) {
        await this.assertOwnership(id, hostId);
        const maxSort = await this.prisma.propertyImage.findFirst({
            where: { propertyId: id },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
        });
        const baseOrder = (maxSort?.sortOrder ?? -1) + 1;
        await this.prisma.propertyImage.createMany({
            data: imageUrls.map((url, i) => ({ propertyId: id, url, sortOrder: baseOrder + i })),
        });
        const images = await this.prisma.propertyImage.findMany({
            where: { propertyId: id },
            orderBy: { sortOrder: 'asc' },
        });
        return { id, images: images.map((img) => ({ url: img.url, sortOrder: img.sortOrder })) };
    }
    async removeImage(id, hostId, imageUrl) {
        await this.assertOwnership(id, hostId);
        await this.prisma.propertyImage.deleteMany({ where: { propertyId: id, url: imageUrl } });
        const images = await this.prisma.propertyImage.findMany({
            where: { propertyId: id },
            orderBy: { sortOrder: 'asc' },
        });
        return { id, images: images.map((img) => ({ url: img.url, sortOrder: img.sortOrder })) };
    }
    async addAmenity(id, hostId, name, icon) {
        await this.assertOwnership(id, hostId);
        const amenity = await this.prisma.propertyAmenity.upsert({
            where: { propertyId_name: { propertyId: id, name } },
            create: { propertyId: id, name, icon: icon || null },
            update: { icon: icon || null },
        });
        return { id, amenity };
    }
    async removeAmenity(id, hostId, amenityId) {
        await this.assertOwnership(id, hostId);
        await this.prisma.propertyAmenity.delete({ where: { id: amenityId } });
        return { id, deleted: true };
    }
    async addRule(id, hostId, rule) {
        await this.assertOwnership(id, hostId);
        const ruleObj = await this.prisma.propertyRule.create({
            data: { propertyId: id, rule },
        });
        return { id, rule: ruleObj };
    }
    async removeRule(id, hostId, ruleId) {
        await this.assertOwnership(id, hostId);
        await this.prisma.propertyRule.delete({ where: { id: ruleId } });
        return { id, deleted: true };
    }
    async findByHost(hostId) {
        const properties = await this.prisma.property.findMany({
            where: { hostId, deletedAt: null },
            include: this.fullInclude,
            orderBy: { createdAt: 'desc' },
        });
        return properties.map((p) => this.formatProperty(p));
    }
    async findOneFromDb(id) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: this.fullInclude,
        });
        if (!property || property.deletedAt)
            throw new common_1.NotFoundException('Property not found');
        return this.formatProperty(property);
    }
    formatProperty(property) {
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
        else if (property.type === 'TRANSPORT' && property.transports?.length) {
            const active = property.transports.filter((t) => t.isActive && t.pricePerSeat != null);
            if (active.length)
                startingPrice = Math.min(...active.map((t) => t.pricePerSeat));
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
            })),
            transports: (property.transports || []).map((t) => ({
                id: t.id,
                name: t.name,
                description: t.description,
                from: t.from,
                to: t.to,
                vehicleType: t.vehicleType,
                capacity: t.capacity,
                pricePerSeat: t.pricePerSeat,
                priceFormatted: t.pricePerSeat != null ? `K${(t.pricePerSeat / 100).toFixed(2)}` : 'K0.00',
                schedule: t.schedule,
                isActive: t.isActive,
            })),
        };
    }
    async assertOwnership(id, hostId) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: { host: { select: { defaultCheckInTime: true, defaultCheckOutTime: true } } },
        });
        if (!property || property.deletedAt)
            throw new common_1.NotFoundException('Property not found');
        if (property.hostId !== hostId)
            throw new common_1.NotFoundException('Property not found');
        return property;
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = PropertiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
exports.ListingsService = PropertiesService;
//# sourceMappingURL=properties.service.js.map