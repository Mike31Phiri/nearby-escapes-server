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
exports.PropertiesService = void 0;
exports.toTagSlug = toTagSlug;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
function toTagSlug(name) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function parseTagsData(tags, foreignKey) {
    return tags.map((t) => {
        const isObj = typeof t === 'object' && t !== null;
        const name = (isObj ? t.name : String(t)).trim();
        const category = (isObj && t.category ? t.category : client_1.TagCategory.CATEGORY);
        const icon = isObj && t.icon ? t.icon : null;
        const slug = toTagSlug(name);
        return {
            ...foreignKey,
            name,
            slug,
            category,
            icon,
        };
    });
}
function parseRecsData(recs, foreignKey) {
    return recs.map((r, i) => ({
        ...foreignKey,
        audience: (r.audience || client_1.RecommendationAudience.GENERAL),
        title: r.title,
        reason: r.reason || null,
        badge: r.badge || null,
        sortOrder: r.sortOrder ?? i,
    }));
}
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
            include: {
                policies: { orderBy: { sortOrder: 'asc' } },
                tags: { orderBy: { createdAt: 'asc' } },
                recommendations: { orderBy: { sortOrder: 'asc' } },
            },
        },
        experiences: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            include: {
                timeSlots: { orderBy: { slot: 'asc' } },
                inclusions: true,
                policies: { orderBy: { sortOrder: 'asc' } },
                tags: { orderBy: { createdAt: 'asc' } },
                recommendations: { orderBy: { sortOrder: 'asc' } },
            },
        },
        transports: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            include: {
                policies: { orderBy: { sortOrder: 'asc' } },
                tags: { orderBy: { createdAt: 'asc' } },
                recommendations: { orderBy: { sortOrder: 'asc' } },
            },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: { orderBy: { name: 'asc' } },
        rules: true,
        tags: { orderBy: { createdAt: 'asc' } },
        recommendations: { orderBy: { sortOrder: 'asc' } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, bookings: true } },
    };
    async createProperty(hostId, dto) {
        const status = dto.isDraft || dto.status === client_1.PropertyStatus.DRAFT
            ? client_1.PropertyStatus.DRAFT
            : (dto.status || client_1.PropertyStatus.ACTIVE);
        const property = await this.prisma.$transaction(async (tx) => {
            const p = await tx.property.create({
                data: {
                    hostId,
                    type: dto.type,
                    status,
                    name: dto.name,
                    description: dto.description || '',
                    location: dto.location || '',
                    currency: dto.currency || 'ZMW',
                    draftStep: dto.draftStep || (status === client_1.PropertyStatus.DRAFT ? 1 : null),
                    draftData: dto.draftData ? JSON.parse(JSON.stringify(dto.draftData)) : undefined,
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
            });
            if (dto.tags?.length) {
                await tx.listingTag.createMany({
                    data: parseTagsData(dto.tags, { propertyId: p.id }),
                });
            }
            if (dto.recommendations?.length) {
                await tx.listingRecommendation.createMany({
                    data: parseRecsData(dto.recommendations, { propertyId: p.id }),
                });
            }
            return tx.property.findUnique({
                where: { id: p.id },
                include: this.fullInclude,
            });
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
        if (dto.currency !== undefined)
            data.currency = dto.currency;
        if (dto.draftStep !== undefined)
            data.draftStep = dto.draftStep;
        if (dto.draftData !== undefined)
            data.draftData = dto.draftData ? JSON.parse(JSON.stringify(dto.draftData)) : null;
        if (dto.isDraft !== undefined) {
            data.status = dto.isDraft ? client_1.PropertyStatus.DRAFT : client_1.PropertyStatus.ACTIVE;
        }
        else if (dto.status !== undefined) {
            data.status = dto.status;
        }
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
        const stay = await this.prisma.$transaction(async (tx) => {
            const s = await tx.stay.create({
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
            if (dto.policies?.length) {
                await tx.listingPolicy.createMany({
                    data: dto.policies.map((p, i) => ({
                        stayId: s.id,
                        category: p.category,
                        title: p.title,
                        body: p.body,
                        sortOrder: p.sortOrder ?? i,
                    })),
                });
            }
            if (dto.tags?.length) {
                await tx.listingTag.createMany({
                    data: parseTagsData(dto.tags, { stayId: s.id }),
                });
            }
            if (dto.recommendations?.length) {
                await tx.listingRecommendation.createMany({
                    data: parseRecsData(dto.recommendations, { stayId: s.id }),
                });
            }
            return tx.stay.findUnique({
                where: { id: s.id },
                include: {
                    policies: { orderBy: { sortOrder: 'asc' } },
                    tags: { orderBy: { createdAt: 'asc' } },
                    recommendations: { orderBy: { sortOrder: 'asc' } },
                },
            });
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
        const exp = await this.prisma.$transaction(async (tx) => {
            const e = await tx.experience.create({
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
            if (dto.policies?.length) {
                await tx.listingPolicy.createMany({
                    data: dto.policies.map((p, i) => ({
                        experienceId: e.id,
                        category: p.category,
                        title: p.title,
                        body: p.body,
                        sortOrder: p.sortOrder ?? i,
                    })),
                });
            }
            if (dto.tags?.length) {
                await tx.listingTag.createMany({
                    data: parseTagsData(dto.tags, { experienceId: e.id }),
                });
            }
            if (dto.recommendations?.length) {
                await tx.listingRecommendation.createMany({
                    data: parseRecsData(dto.recommendations, { experienceId: e.id }),
                });
            }
            return tx.experience.findUnique({
                where: { id: e.id },
                include: {
                    timeSlots: { orderBy: { slot: 'asc' } },
                    inclusions: true,
                    policies: { orderBy: { sortOrder: 'asc' } },
                    tags: { orderBy: { createdAt: 'asc' } },
                    recommendations: { orderBy: { sortOrder: 'asc' } },
                },
            });
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
        const transport = await this.prisma.$transaction(async (tx) => {
            const t = await tx.transport.create({
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
            if (dto.policies?.length) {
                await tx.listingPolicy.createMany({
                    data: dto.policies.map((p, i) => ({
                        transportId: t.id,
                        category: p.category,
                        title: p.title,
                        body: p.body,
                        sortOrder: p.sortOrder ?? i,
                    })),
                });
            }
            if (dto.tags?.length) {
                await tx.listingTag.createMany({
                    data: parseTagsData(dto.tags, { transportId: t.id }),
                });
            }
            if (dto.recommendations?.length) {
                await tx.listingRecommendation.createMany({
                    data: parseRecsData(dto.recommendations, { transportId: t.id }),
                });
            }
            return tx.transport.findUnique({
                where: { id: t.id },
                include: {
                    policies: { orderBy: { sortOrder: 'asc' } },
                    tags: { orderBy: { createdAt: 'asc' } },
                    recommendations: { orderBy: { sortOrder: 'asc' } },
                },
            });
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
    async findByHost(hostId, status) {
        const properties = await this.prisma.property.findMany({
            where: {
                hostId,
                deletedAt: null,
                ...(status ? { status } : {}),
            },
            include: this.fullInclude,
            orderBy: { createdAt: 'desc' },
        });
        return properties.map((p) => this.formatProperty(p));
    }
    async findDraftsByHost(hostId) {
        const drafts = await this.prisma.property.findMany({
            where: {
                hostId,
                status: client_1.PropertyStatus.DRAFT,
                deletedAt: null,
            },
            include: this.fullInclude,
            orderBy: { updatedAt: 'desc' },
        });
        return drafts.map((d) => this.formatProperty(d));
    }
    async findDraftById(id, hostId) {
        await this.assertOwnership(id, hostId);
        const draft = await this.prisma.property.findUnique({
            where: { id },
            include: this.fullInclude,
        });
        if (!draft || draft.deletedAt)
            throw new common_1.NotFoundException('Draft listing not found');
        return this.formatProperty(draft);
    }
    async saveDraft(hostId, dto) {
        return this.createProperty(hostId, {
            ...dto,
            isDraft: true,
            status: client_1.PropertyStatus.DRAFT,
        });
    }
    async updateDraft(propertyId, hostId, dto) {
        return this.update(propertyId, hostId, {
            ...dto,
            isDraft: true,
            status: client_1.PropertyStatus.DRAFT,
        });
    }
    async publishListing(propertyId, hostId) {
        await this.assertOwnership(propertyId, hostId);
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                images: true,
                stays: { where: { deletedAt: null } },
                experiences: { where: { deletedAt: null } },
                transports: { where: { deletedAt: null } },
            },
        });
        if (!property)
            throw new common_1.NotFoundException('Listing not found');
        const errors = [];
        if (!property.name || !property.name.trim())
            errors.push('Listing name is required.');
        if (!property.description || !property.description.trim())
            errors.push('Listing description is required.');
        if (!property.location || !property.location.trim())
            errors.push('Listing location is required.');
        if (!property.images || property.images.length === 0)
            errors.push('At least one photo is required to publish.');
        const unitCount = (property.stays?.length || 0) +
            (property.experiences?.length || 0) +
            (property.transports?.length || 0);
        if (unitCount === 0) {
            errors.push(`At least one bookable ${property.type.toLowerCase()} unit must be added before publishing.`);
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Cannot publish incomplete listing draft.',
                errors,
            });
        }
        const updated = await this.prisma.property.update({
            where: { id: propertyId },
            data: {
                status: client_1.PropertyStatus.ACTIVE,
                draftStep: null,
            },
            include: this.fullInclude,
        });
        return this.formatProperty(updated);
    }
    async saveWizardStep(propertyId, hostId, step, payload) {
        await this.assertOwnership(propertyId, hostId);
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: { stays: true, experiences: true, transports: true },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        const updateData = {
            draftStep: Math.max(step + 1, property.draftStep || 1),
        };
        if (payload.name !== undefined)
            updateData.name = payload.name;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.location !== undefined)
            updateData.location = payload.location;
        if (payload.currency !== undefined)
            updateData.currency = payload.currency;
        if (payload.draftData !== undefined) {
            updateData.draftData = payload.draftData ? JSON.parse(JSON.stringify(payload.draftData)) : null;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.property.update({
                where: { id: propertyId },
                data: updateData,
            });
            if (payload.images && Array.isArray(payload.images)) {
                await tx.propertyImage.deleteMany({ where: { propertyId } });
                if (payload.images.length > 0) {
                    await tx.propertyImage.createMany({
                        data: payload.images.map((url, i) => ({
                            propertyId,
                            url,
                            sortOrder: i,
                        })),
                    });
                }
            }
            if (payload.amenities && Array.isArray(payload.amenities)) {
                await tx.propertyAmenity.deleteMany({ where: { propertyId } });
                if (payload.amenities.length > 0) {
                    await tx.propertyAmenity.createMany({
                        data: payload.amenities.map((name) => ({ propertyId, name })),
                    });
                }
            }
            if (payload.rules && Array.isArray(payload.rules)) {
                await tx.propertyRule.deleteMany({ where: { propertyId } });
                if (payload.rules.length > 0) {
                    await tx.propertyRule.createMany({
                        data: payload.rules.map((rule) => ({ propertyId, rule })),
                    });
                }
            }
            if (payload.tags && Array.isArray(payload.tags)) {
                await tx.listingTag.deleteMany({ where: { propertyId } });
                if (payload.tags.length > 0) {
                    await tx.listingTag.createMany({
                        data: parseTagsData(payload.tags, { propertyId }),
                    });
                }
            }
            if (payload.recommendations && Array.isArray(payload.recommendations)) {
                await tx.listingRecommendation.deleteMany({ where: { propertyId } });
                if (payload.recommendations.length > 0) {
                    await tx.listingRecommendation.createMany({
                        data: parseRecsData(payload.recommendations, { propertyId }),
                    });
                }
            }
            let primaryStayId = property.stays?.[0]?.id;
            if (property.type === 'STAY' && (payload.stay || payload.stays)) {
                const stayList = payload.stays || [payload.stay];
                for (const s of stayList) {
                    if (!s)
                        continue;
                    if (primaryStayId) {
                        await tx.stay.update({
                            where: { id: primaryStayId },
                            data: {
                                name: s.name ?? undefined,
                                description: s.description ?? undefined,
                                price: s.price !== undefined ? s.price : undefined,
                                roomType: s.roomType ?? undefined,
                                bedrooms: s.bedrooms ?? undefined,
                                beds: s.beds ?? undefined,
                                baths: s.baths ?? undefined,
                                maxGuests: s.maxGuests ?? undefined,
                                checkInFrom: s.checkInFrom ?? undefined,
                                checkInUntil: s.checkInUntil ?? undefined,
                                checkOutBefore: s.checkOutBefore ?? undefined,
                                cancellationPolicy: s.cancellationPolicy ?? undefined,
                            },
                        });
                    }
                    else if (s.name && s.price !== undefined) {
                        const createdStay = await tx.stay.create({
                            data: {
                                propertyId,
                                name: s.name,
                                description: s.description || null,
                                price: s.price,
                                roomType: s.roomType || null,
                                bedrooms: s.bedrooms ?? null,
                                beds: s.beds ?? null,
                                baths: s.baths ?? null,
                                maxGuests: s.maxGuests ?? null,
                                checkInFrom: s.checkInFrom || '14:00',
                                checkInUntil: s.checkInUntil || null,
                                checkOutBefore: s.checkOutBefore || '10:00',
                                cancellationPolicy: s.cancellationPolicy || null,
                            },
                        });
                        primaryStayId = createdStay.id;
                    }
                }
            }
            let primaryExpId = property.experiences?.[0]?.id;
            if (property.type === 'EXPERIENCE' && (payload.experience || payload.experiences)) {
                const expList = payload.experiences || [payload.experience];
                for (const e of expList) {
                    if (!e)
                        continue;
                    if (primaryExpId) {
                        await tx.experience.update({
                            where: { id: primaryExpId },
                            data: {
                                name: e.name ?? undefined,
                                description: e.description ?? undefined,
                                price: e.price !== undefined ? e.price : undefined,
                                activityType: e.activityType ?? undefined,
                                duration: e.duration ?? undefined,
                                maxParticipants: e.maxParticipants ?? undefined,
                                difficultyLevel: e.difficultyLevel ?? undefined,
                                meetingPoint: e.meetingPoint ?? undefined,
                            },
                        });
                    }
                    else if (e.name && e.price !== undefined) {
                        const createdExp = await tx.experience.create({
                            data: {
                                propertyId,
                                name: e.name,
                                description: e.description || null,
                                price: e.price,
                                activityType: e.activityType || null,
                                duration: e.duration || null,
                                maxParticipants: e.maxParticipants ?? null,
                                difficultyLevel: e.difficultyLevel || null,
                                meetingPoint: e.meetingPoint || null,
                            },
                        });
                        primaryExpId = createdExp.id;
                    }
                }
            }
            let primaryTransId = property.transports?.[0]?.id;
            if (property.type === 'TRANSPORT' && (payload.transport || payload.transports)) {
                const transList = payload.transports || [payload.transport];
                for (const t of transList) {
                    if (!t)
                        continue;
                    if (primaryTransId) {
                        await tx.transport.update({
                            where: { id: primaryTransId },
                            data: {
                                name: t.name ?? undefined,
                                description: t.description ?? undefined,
                                from: t.from ?? undefined,
                                to: t.to ?? undefined,
                                vehicleType: t.vehicleType ?? undefined,
                                capacity: t.capacity ?? undefined,
                                pricePerSeat: t.pricePerSeat !== undefined ? t.pricePerSeat : undefined,
                                schedule: t.schedule ? JSON.parse(JSON.stringify(t.schedule)) : undefined,
                            },
                        });
                    }
                    else if (t.name) {
                        const createdTrans = await tx.transport.create({
                            data: {
                                propertyId,
                                name: t.name,
                                description: t.description || null,
                                from: t.from || null,
                                to: t.to || null,
                                vehicleType: t.vehicleType || null,
                                capacity: t.capacity ?? null,
                                pricePerSeat: t.pricePerSeat ?? null,
                                schedule: t.schedule ? JSON.parse(JSON.stringify(t.schedule)) : null,
                            },
                        });
                        primaryTransId = createdTrans.id;
                    }
                }
            }
            if (payload.policies && Array.isArray(payload.policies)) {
                const targetStayId = primaryStayId || property.stays?.[0]?.id;
                const targetExpId = primaryExpId || property.experiences?.[0]?.id;
                const targetTransId = primaryTransId || property.transports?.[0]?.id;
                if (targetStayId) {
                    await tx.listingPolicy.deleteMany({ where: { stayId: targetStayId } });
                    if (payload.policies.length > 0) {
                        await tx.listingPolicy.createMany({
                            data: payload.policies.map((p, i) => ({
                                stayId: targetStayId,
                                category: p.category || 'OTHER',
                                title: p.title,
                                body: p.body,
                                sortOrder: p.sortOrder ?? i,
                            })),
                        });
                    }
                }
                else if (targetExpId) {
                    await tx.listingPolicy.deleteMany({ where: { experienceId: targetExpId } });
                    if (payload.policies.length > 0) {
                        await tx.listingPolicy.createMany({
                            data: payload.policies.map((p, i) => ({
                                experienceId: targetExpId,
                                category: p.category || 'OTHER',
                                title: p.title,
                                body: p.body,
                                sortOrder: p.sortOrder ?? i,
                            })),
                        });
                    }
                }
                else if (targetTransId) {
                    await tx.listingPolicy.deleteMany({ where: { transportId: targetTransId } });
                    if (payload.policies.length > 0) {
                        await tx.listingPolicy.createMany({
                            data: payload.policies.map((p, i) => ({
                                transportId: targetTransId,
                                category: p.category || 'OTHER',
                                title: p.title,
                                body: p.body,
                                sortOrder: p.sortOrder ?? i,
                            })),
                        });
                    }
                }
            }
        });
        const updated = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: this.fullInclude,
        });
        return {
            ...this.formatProperty(updated),
            savedStep: step,
            nextStep: Math.min(step + 1, 8),
        };
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
            isDraft: property.status === client_1.PropertyStatus.DRAFT,
            draftStep: property.draftStep ?? null,
            draftData: property.draftData ?? null,
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
            tags: (property.tags || []).map((t) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                category: t.category,
                icon: t.icon,
            })),
            recommendations: (property.recommendations || []).map((r) => ({
                id: r.id,
                audience: r.audience,
                title: r.title,
                reason: r.reason,
                badge: r.badge,
                sortOrder: r.sortOrder,
            })),
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
                tags: (s.tags || []).map((t) => ({ id: t.id, name: t.name, slug: t.slug, category: t.category, icon: t.icon })),
                recommendations: (s.recommendations || []).map((r) => ({ id: r.id, audience: r.audience, title: r.title, reason: r.reason, badge: r.badge, sortOrder: r.sortOrder })),
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
                tags: (e.tags || []).map((t) => ({ id: t.id, name: t.name, slug: t.slug, category: t.category, icon: t.icon })),
                recommendations: (e.recommendations || []).map((r) => ({ id: r.id, audience: r.audience, title: r.title, reason: r.reason, badge: r.badge, sortOrder: r.sortOrder })),
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
                policies: t.policies || [],
                tags: (t.tags || []).map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug, category: tag.category, icon: tag.icon })),
                recommendations: (t.recommendations || []).map((r) => ({ id: r.id, audience: r.audience, title: r.title, reason: r.reason, badge: r.badge, sortOrder: r.sortOrder })),
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
    async getListingPolicies(unitType, unitId) {
        return this.prisma.listingPolicy.findMany({
            where: {
                ...(unitType === 'stay' ? { stayId: unitId } : {}),
                ...(unitType === 'experience' ? { experienceId: unitId } : {}),
                ...(unitType === 'transport' ? { transportId: unitId } : {}),
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async addListingPolicy(unitType, unitId, hostId, dto) {
        await this._assertUnitOwnership(unitType, unitId, hostId);
        return this.prisma.listingPolicy.create({
            data: {
                ...(unitType === 'stay' ? { stayId: unitId } : {}),
                ...(unitType === 'experience' ? { experienceId: unitId } : {}),
                ...(unitType === 'transport' ? { transportId: unitId } : {}),
                category: dto.category,
                title: dto.title,
                body: dto.body,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }
    async setListingPolicies(unitType, unitId, hostId, dto) {
        await this._assertUnitOwnership(unitType, unitId, hostId);
        const whereClause = {
            ...(unitType === 'stay' ? { stayId: unitId } : {}),
            ...(unitType === 'experience' ? { experienceId: unitId } : {}),
            ...(unitType === 'transport' ? { transportId: unitId } : {}),
        };
        await this.prisma.$transaction(async (tx) => {
            await tx.listingPolicy.deleteMany({ where: whereClause });
            if (dto.policies.length > 0) {
                await tx.listingPolicy.createMany({
                    data: dto.policies.map((p, i) => ({
                        ...whereClause,
                        category: p.category,
                        title: p.title,
                        body: p.body,
                        sortOrder: p.sortOrder ?? i,
                    })),
                });
            }
        });
        return this.getListingPolicies(unitType, unitId);
    }
    async updateListingPolicy(policyId, hostId, dto) {
        const policy = await this.prisma.listingPolicy.findUnique({ where: { id: policyId } });
        if (!policy)
            throw new common_1.NotFoundException('Listing policy not found');
        if (policy.stayId)
            await this._assertUnitOwnership('stay', policy.stayId, hostId);
        if (policy.experienceId)
            await this._assertUnitOwnership('experience', policy.experienceId, hostId);
        if (policy.transportId)
            await this._assertUnitOwnership('transport', policy.transportId, hostId);
        return this.prisma.listingPolicy.update({
            where: { id: policyId },
            data: {
                ...(dto.category !== undefined ? { category: dto.category } : {}),
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.body !== undefined ? { body: dto.body } : {}),
                ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
            },
        });
    }
    async removeListingPolicy(policyId, hostId) {
        const policy = await this.prisma.listingPolicy.findUnique({ where: { id: policyId } });
        if (!policy)
            throw new common_1.NotFoundException('Listing policy not found');
        if (policy.stayId)
            await this._assertUnitOwnership('stay', policy.stayId, hostId);
        if (policy.experienceId)
            await this._assertUnitOwnership('experience', policy.experienceId, hostId);
        if (policy.transportId)
            await this._assertUnitOwnership('transport', policy.transportId, hostId);
        await this.prisma.listingPolicy.delete({ where: { id: policyId } });
        return { id: policyId, deleted: true };
    }
    async _assertUnitOwnership(unitType, unitId, hostId) {
        if (unitType === 'stay') {
            const stay = await this.prisma.stay.findUnique({
                where: { id: unitId },
                include: { property: { select: { hostId: true } } },
            });
            if (!stay || stay.property.hostId !== hostId) {
                throw new common_1.NotFoundException('Stay unit not found or access denied');
            }
        }
        else if (unitType === 'experience') {
            const exp = await this.prisma.experience.findUnique({
                where: { id: unitId },
                include: { property: { select: { hostId: true } } },
            });
            if (!exp || exp.property.hostId !== hostId) {
                throw new common_1.NotFoundException('Experience unit not found or access denied');
            }
        }
        else {
            const trans = await this.prisma.transport.findUnique({
                where: { id: unitId },
                include: { property: { select: { hostId: true } } },
            });
            if (!trans || trans.property.hostId !== hostId) {
                throw new common_1.NotFoundException('Transport unit not found or access denied');
            }
        }
    }
    _getTagTargetClause(targetType, targetId) {
        switch (targetType) {
            case 'property': return { propertyId: targetId };
            case 'stay': return { stayId: targetId };
            case 'experience': return { experienceId: targetId };
            case 'transport': return { transportId: targetId };
        }
    }
    async getTags(targetType, targetId) {
        const where = this._getTagTargetClause(targetType, targetId);
        return this.prisma.listingTag.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });
    }
    async setTags(targetType, targetId, hostId, tags) {
        if (targetType === 'property') {
            await this.assertOwnership(targetId, hostId);
        }
        else {
            await this._assertUnitOwnership(targetType, targetId, hostId);
        }
        const foreignKey = this._getTagTargetClause(targetType, targetId);
        await this.prisma.$transaction(async (tx) => {
            await tx.listingTag.deleteMany({ where: foreignKey });
            if (tags.length > 0) {
                await tx.listingTag.createMany({
                    data: parseTagsData(tags, foreignKey),
                });
            }
        });
        return this.getTags(targetType, targetId);
    }
    async addTag(targetType, targetId, hostId, dto) {
        if (targetType === 'property') {
            await this.assertOwnership(targetId, hostId);
        }
        else {
            await this._assertUnitOwnership(targetType, targetId, hostId);
        }
        const foreignKey = this._getTagTargetClause(targetType, targetId);
        const slug = toTagSlug(dto.name);
        return this.prisma.listingTag.create({
            data: {
                ...foreignKey,
                name: dto.name.trim(),
                slug,
                category: (dto.category || client_1.TagCategory.CATEGORY),
                icon: dto.icon || null,
            },
        });
    }
    async removeTag(tagId, hostId) {
        const tag = await this.prisma.listingTag.findUnique({
            where: { id: tagId },
            include: {
                property: { select: { hostId: true } },
                stay: { include: { property: { select: { hostId: true } } } },
                experience: { include: { property: { select: { hostId: true } } } },
                transport: { include: { property: { select: { hostId: true } } } },
            },
        });
        if (!tag)
            throw new common_1.NotFoundException('Tag not found');
        const ownerHostId = tag.property?.hostId ||
            tag.stay?.property?.hostId ||
            tag.experience?.property?.hostId ||
            tag.transport?.property?.hostId;
        if (ownerHostId !== hostId) {
            throw new common_1.ForbiddenException('Access denied: You do not own this listing');
        }
        await this.prisma.listingTag.delete({ where: { id: tagId } });
        return { id: tagId, deleted: true };
    }
    async getRecommendations(targetType, targetId) {
        const where = this._getTagTargetClause(targetType, targetId);
        return this.prisma.listingRecommendation.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
    }
    async setRecommendations(targetType, targetId, hostId, dtos) {
        if (targetType === 'property') {
            await this.assertOwnership(targetId, hostId);
        }
        else {
            await this._assertUnitOwnership(targetType, targetId, hostId);
        }
        const foreignKey = this._getTagTargetClause(targetType, targetId);
        await this.prisma.$transaction(async (tx) => {
            await tx.listingRecommendation.deleteMany({ where: foreignKey });
            if (dtos.length > 0) {
                await tx.listingRecommendation.createMany({
                    data: parseRecsData(dtos, foreignKey),
                });
            }
        });
        return this.getRecommendations(targetType, targetId);
    }
    async addRecommendation(targetType, targetId, hostId, dto) {
        if (targetType === 'property') {
            await this.assertOwnership(targetId, hostId);
        }
        else {
            await this._assertUnitOwnership(targetType, targetId, hostId);
        }
        const foreignKey = this._getTagTargetClause(targetType, targetId);
        return this.prisma.listingRecommendation.create({
            data: {
                ...foreignKey,
                audience: (dto.audience || client_1.RecommendationAudience.GENERAL),
                title: dto.title.trim(),
                reason: dto.reason || null,
                badge: dto.badge || null,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }
    async removeRecommendation(recId, hostId) {
        const rec = await this.prisma.listingRecommendation.findUnique({
            where: { id: recId },
            include: {
                property: { select: { hostId: true } },
                stay: { include: { property: { select: { hostId: true } } } },
                experience: { include: { property: { select: { hostId: true } } } },
                transport: { include: { property: { select: { hostId: true } } } },
            },
        });
        if (!rec)
            throw new common_1.NotFoundException('Recommendation not found');
        const ownerHostId = rec.property?.hostId ||
            rec.stay?.property?.hostId ||
            rec.experience?.property?.hostId ||
            rec.transport?.property?.hostId;
        if (ownerHostId !== hostId) {
            throw new common_1.ForbiddenException('Access denied: You do not own this listing');
        }
        await this.prisma.listingRecommendation.delete({ where: { id: recId } });
        return { id: recId, deleted: true };
    }
    async getAllAvailableTags() {
        const tags = await this.prisma.listingTag.findMany({
            where: {
                OR: [
                    { property: { status: client_1.PropertyStatus.ACTIVE, deletedAt: null } },
                    { stay: { property: { status: client_1.PropertyStatus.ACTIVE, deletedAt: null } } },
                    { experience: { property: { status: client_1.PropertyStatus.ACTIVE, deletedAt: null } } },
                    { transport: { property: { status: client_1.PropertyStatus.ACTIVE, deletedAt: null } } },
                ],
            },
            select: {
                category: true,
                name: true,
                slug: true,
                icon: true,
            },
            distinct: ['category', 'slug'],
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
        const grouped = {
            CATEGORY: [],
            AMENITY: [],
            ACTIVITY: [],
            LOCATION: [],
            TRIP_TYPE: [],
            VEHICLE_TYPE: [],
            OTHER: [],
        };
        for (const t of tags) {
            if (!grouped[t.category])
                grouped[t.category] = [];
            grouped[t.category].push({ name: t.name, slug: t.slug, icon: t.icon });
        }
        return grouped;
    }
    async filterByTags(query) {
        const tagConditions = [];
        if (query.category) {
            const slug = toTagSlug(query.category);
            tagConditions.push({
                OR: [
                    { tags: { some: { category: client_1.TagCategory.CATEGORY, slug } } },
                    { stays: { some: { tags: { some: { category: client_1.TagCategory.CATEGORY, slug } } } } },
                    { experiences: { some: { tags: { some: { category: client_1.TagCategory.CATEGORY, slug } } } } },
                    { transports: { some: { tags: { some: { category: client_1.TagCategory.CATEGORY, slug } } } } },
                ],
            });
        }
        if (query.activity) {
            const slug = toTagSlug(query.activity);
            tagConditions.push({
                OR: [
                    { tags: { some: { category: client_1.TagCategory.ACTIVITY, slug } } },
                    { experiences: { some: { tags: { some: { category: client_1.TagCategory.ACTIVITY, slug } } } } },
                ],
            });
        }
        if (query.amenity) {
            const slug = toTagSlug(query.amenity);
            tagConditions.push({
                OR: [
                    { tags: { some: { category: client_1.TagCategory.AMENITY, slug } } },
                    { amenities: { some: { name: { contains: query.amenity, mode: 'insensitive' } } } },
                    { stays: { some: { tags: { some: { category: client_1.TagCategory.AMENITY, slug } } } } },
                    { transports: { some: { tags: { some: { category: client_1.TagCategory.AMENITY, slug } } } } },
                ],
            });
        }
        if (query.location) {
            const slug = toTagSlug(query.location);
            tagConditions.push({
                OR: [
                    { location: { contains: query.location, mode: 'insensitive' } },
                    { tags: { some: { category: client_1.TagCategory.LOCATION, slug } } },
                ],
            });
        }
        if (query.tripType) {
            const slug = toTagSlug(query.tripType);
            tagConditions.push({
                OR: [
                    { tags: { some: { category: client_1.TagCategory.TRIP_TYPE, slug } } },
                    { transports: { some: { tags: { some: { category: client_1.TagCategory.TRIP_TYPE, slug } } } } },
                ],
            });
        }
        if (query.vehicleType) {
            const slug = toTagSlug(query.vehicleType);
            tagConditions.push({
                OR: [
                    { tags: { some: { category: client_1.TagCategory.VEHICLE_TYPE, slug } } },
                    { transports: { some: { vehicleType: { contains: query.vehicleType, mode: 'insensitive' } } } },
                    { transports: { some: { tags: { some: { category: client_1.TagCategory.VEHICLE_TYPE, slug } } } } },
                ],
            });
        }
        if (query.recommendation) {
            const audience = query.recommendation.toUpperCase();
            tagConditions.push({
                OR: [
                    { recommendations: { some: { audience } } },
                    { stays: { some: { recommendations: { some: { audience } } } } },
                    { experiences: { some: { recommendations: { some: { audience } } } } },
                    { transports: { some: { recommendations: { some: { audience } } } } },
                ],
            });
        }
        if (query.tag) {
            const slug = toTagSlug(query.tag);
            tagConditions.push({
                OR: [
                    { tags: { some: { slug } } },
                    { stays: { some: { tags: { some: { slug } } } } },
                    { experiences: { some: { tags: { some: { slug } } } } },
                    { transports: { some: { tags: { some: { slug } } } } },
                ],
            });
        }
        const properties = await this.prisma.property.findMany({
            where: {
                deletedAt: null,
                status: 'ACTIVE',
                AND: tagConditions.length ? tagConditions : undefined,
            },
            include: this.fullInclude,
            orderBy: { createdAt: 'desc' },
        });
        return properties.map((p) => this.formatProperty(p));
    }
    async getSampleImages(category, limit) {
        const where = {};
        if (category) {
            where.category = category.toUpperCase();
        }
        const assets = await this.prisma.mediaAsset.findMany({
            where,
            take: limit || 100,
            orderBy: { createdAt: 'asc' },
        });
        return assets.map((a) => ({
            id: a.id,
            url: a.url,
            category: a.category,
            source: a.source,
            caption: a.caption,
        }));
    }
    async createUnifiedListing(hostId, dto) {
        const propertyType = dto.vertical.toUpperCase();
        const fullLocation = [dto.address, dto.city, dto.province].filter(Boolean).join(', ');
        const policyMap = {
            flexible: client_1.CancellationPolicy.FLEXIBLE,
            moderate: client_1.CancellationPolicy.MODERATE,
            strict: client_1.CancellationPolicy.STRICT,
        };
        const cancellationPolicy = policyMap[dto.cancellationPolicy.toLowerCase()] || client_1.CancellationPolicy.MODERATE;
        const property = await this.prisma.$transaction(async (tx) => {
            const prop = await tx.property.create({
                data: {
                    hostId,
                    type: propertyType,
                    status: client_1.PropertyStatus.ACTIVE,
                    name: dto.title,
                    description: dto.description,
                    location: fullLocation,
                    currency: dto.currency || 'ZMW',
                    draftData: {
                        city: dto.city,
                        province: dto.province,
                        address: dto.address,
                        latitude: dto.latitude,
                        longitude: dto.longitude,
                        inventoryCount: dto.inventoryCount || dto.stayDetails?.inventoryCount || 1,
                    },
                },
            });
            if (dto.images && dto.images.length > 0) {
                await tx.propertyImage.createMany({
                    data: dto.images.map((url, idx) => ({
                        propertyId: prop.id,
                        url,
                        sortOrder: idx,
                    })),
                });
            }
            const allAmenities = new Set();
            (dto.amenities || []).forEach((a) => allAmenities.add(a));
            (dto.stayDetails?.guestFavourites || []).forEach((a) => allAmenities.add(a));
            (dto.stayDetails?.standoutAmenities || []).forEach((a) => allAmenities.add(a));
            (dto.stayDetails?.safetyAmenities || []).forEach((a) => allAmenities.add(a));
            if (allAmenities.size > 0) {
                await tx.propertyAmenity.createMany({
                    data: Array.from(allAmenities).map((name) => ({
                        propertyId: prop.id,
                        name,
                    })),
                    skipDuplicates: true,
                });
            }
            if (dto.houseRules && dto.houseRules.length > 0) {
                await tx.propertyRule.createMany({
                    data: dto.houseRules.map((rule) => ({
                        propertyId: prop.id,
                        rule,
                    })),
                });
            }
            if (propertyType === 'STAY') {
                const stayDetails = dto.stayDetails;
                const totalCount = dto.inventoryCount || stayDetails?.inventoryCount || (stayDetails?.units?.length || 1);
                const units = [];
                if (stayDetails?.units && stayDetails.units.length > 0) {
                    stayDetails.units.forEach((u) => {
                        units.push({
                            name: u.name,
                            type: u.type || stayDetails?.propertyType || 'Standard Room',
                            maxGuests: u.maxGuests || stayDetails?.maxGuests || 2,
                        });
                    });
                    for (let i = units.length; i < totalCount; i++) {
                        units.push({
                            name: `${dto.title} ${i + 1}`,
                            type: stayDetails?.propertyType || 'Standard Room',
                            maxGuests: stayDetails?.maxGuests || 2,
                        });
                    }
                }
                else if (totalCount > 1) {
                    for (let i = 0; i < totalCount; i++) {
                        units.push({
                            name: `${dto.title} ${i + 1}`,
                            type: stayDetails?.propertyType || 'Standard Room',
                            maxGuests: stayDetails?.maxGuests || 2,
                        });
                    }
                }
                else {
                    units.push({
                        name: dto.title,
                        type: stayDetails?.propertyType || 'Standard Room',
                        maxGuests: stayDetails?.maxGuests || 2,
                    });
                }
                for (let i = 0; i < units.length; i++) {
                    const u = units[i];
                    const stay = await tx.stay.create({
                        data: {
                            propertyId: prop.id,
                            name: u.name,
                            roomType: u.type,
                            price: dto.pricePerUnitNgwee,
                            bedrooms: stayDetails?.bedrooms || 1,
                            beds: stayDetails?.beds || 1,
                            baths: stayDetails?.baths || 1,
                            maxGuests: u.maxGuests,
                            checkInFrom: stayDetails?.checkInFrom || '14:00',
                            checkInUntil: stayDetails?.checkInUntil || '20:00',
                            checkOutBefore: stayDetails?.checkOutBefore || '11:00',
                            cancellationPolicy,
                            isActive: true,
                            sortOrder: i,
                        },
                    });
                    await tx.listingPolicy.create({
                        data: {
                            stayId: stay.id,
                            category: 'CANCELLATION',
                            title: `${dto.cancellationPolicy.toUpperCase()} Cancellation Policy`,
                            body: `Standard ${dto.cancellationPolicy} cancellation policy applies.`,
                        },
                    });
                }
            }
            else if (propertyType === 'EXPERIENCE') {
                const expDetails = dto.experienceDetails;
                const exp = await tx.experience.create({
                    data: {
                        propertyId: prop.id,
                        name: dto.title,
                        description: dto.description,
                        price: dto.pricePerUnitNgwee,
                        activityType: expDetails?.activityType || 'Activity',
                        duration: expDetails?.durationMinutes
                            ? `${expDetails.durationMinutes} mins`
                            : '2 hours',
                        maxParticipants: expDetails?.maxParticipants || 10,
                        difficultyLevel: expDetails?.difficulty
                            ? expDetails.difficulty.charAt(0).toUpperCase() + expDetails.difficulty.slice(1)
                            : 'Moderate',
                        meetingPoint: expDetails?.meetingPoint || fullLocation,
                        isActive: true,
                    },
                });
                if (expDetails?.whatsIncluded && expDetails.whatsIncluded.length > 0) {
                    await tx.experienceInclusion.createMany({
                        data: expDetails.whatsIncluded.map((item) => ({
                            experienceId: exp.id,
                            item,
                        })),
                    });
                }
                if (expDetails?.timeSlots && expDetails.timeSlots.length > 0) {
                    await tx.experienceTimeSlot.createMany({
                        data: expDetails.timeSlots.map((ts) => ({
                            experienceId: exp.id,
                            slot: ts.timeSlot,
                        })),
                    });
                }
                if (expDetails?.whatToBring && expDetails.whatToBring.length > 0) {
                    await tx.listingPolicy.create({
                        data: {
                            experienceId: exp.id,
                            category: 'SAFETY',
                            title: 'What to Bring',
                            body: expDetails.whatToBring.join(', '),
                        },
                    });
                }
            }
            else if (propertyType === 'TRANSPORT') {
                const transDetails = dto.transportDetails;
                const trans = await tx.transport.create({
                    data: {
                        propertyId: prop.id,
                        name: dto.title,
                        description: dto.description,
                        from: transDetails?.pickupLocation || dto.city,
                        to: transDetails?.dropoffLocation || dto.city,
                        vehicleType: transDetails?.vehicleType || 'Vehicle',
                        capacity: transDetails?.seatingCapacity || 14,
                        pricePerSeat: dto.pricePerUnitNgwee,
                        schedule: transDetails?.fleetUnits ? { fleet: transDetails.fleetUnits } : undefined,
                        isActive: true,
                    },
                });
                if (transDetails?.guidelines && transDetails.guidelines.length > 0) {
                    await tx.listingPolicy.create({
                        data: {
                            transportId: trans.id,
                            category: 'OTHER',
                            title: 'Guidelines',
                            body: transDetails.guidelines.join('; '),
                        },
                    });
                }
            }
            return prop;
        });
        const baseSlug = dto.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const slug = `${baseSlug || 'listing'}-${property.id.slice(0, 8)}`;
        return {
            id: property.id,
            vertical: dto.vertical,
            title: property.name,
            slug,
            status: 'active',
            pricePerUnitNgwee: dto.pricePerUnitNgwee,
            currency: 'ZMW',
            createdAt: property.createdAt.toISOString(),
        };
    }
    async updateListingStatus(id, hostId, statusStr) {
        const property = await this.prisma.property.findUnique({
            where: { id },
        });
        if (!property)
            throw new common_1.NotFoundException('Listing not found');
        if (property.hostId !== hostId) {
            const user = await this.prisma.user.findUnique({ where: { id: hostId } });
            if (user?.role !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only the host can update this listing status');
            }
        }
        let prismaStatus = client_1.PropertyStatus.ACTIVE;
        let deletedAt = null;
        let returnStatus = 'active';
        let childActive = true;
        const s = statusStr.toLowerCase();
        if (s === 'active') {
            prismaStatus = client_1.PropertyStatus.ACTIVE;
            deletedAt = null;
            returnStatus = 'active';
            childActive = true;
        }
        else if (s === 'draft') {
            prismaStatus = client_1.PropertyStatus.DRAFT;
            deletedAt = null;
            returnStatus = 'draft';
            childActive = false;
        }
        else if (s === 'paused' || s === 'inactive') {
            prismaStatus = client_1.PropertyStatus.INACTIVE;
            deletedAt = null;
            returnStatus = s === 'inactive' ? 'inactive' : 'paused';
            childActive = false;
        }
        else if (s === 'archived') {
            prismaStatus = client_1.PropertyStatus.INACTIVE;
            deletedAt = new Date();
            returnStatus = 'archived';
            childActive = false;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.property.update({
                where: { id },
                data: {
                    status: prismaStatus,
                    deletedAt,
                },
            });
            await tx.stay.updateMany({
                where: { propertyId: id },
                data: {
                    isActive: childActive,
                    ...(deletedAt ? { deletedAt } : {}),
                },
            });
            await tx.experience.updateMany({
                where: { propertyId: id },
                data: {
                    isActive: childActive,
                    ...(deletedAt ? { deletedAt } : {}),
                },
            });
            await tx.transport.updateMany({
                where: { propertyId: id },
                data: {
                    isActive: childActive,
                    ...(deletedAt ? { deletedAt } : {}),
                },
            });
        });
        return {
            id: property.id,
            status: returnStatus,
            updatedAt: new Date().toISOString(),
        };
    }
    async deleteListing(id, hostId) {
        const property = await this.prisma.property.findUnique({
            where: { id },
        });
        if (!property)
            throw new common_1.NotFoundException('Listing not found');
        if (property.hostId !== hostId) {
            const user = await this.prisma.user.findUnique({ where: { id: hostId } });
            if (user?.role !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only the host can delete this listing');
            }
        }
        const now = new Date();
        await this.prisma.$transaction(async (tx) => {
            await tx.property.update({
                where: { id },
                data: {
                    deletedAt: now,
                    status: client_1.PropertyStatus.INACTIVE,
                },
            });
            await tx.stay.updateMany({
                where: { propertyId: id },
                data: {
                    deletedAt: now,
                    isActive: false,
                },
            });
            await tx.experience.updateMany({
                where: { propertyId: id },
                data: {
                    deletedAt: now,
                    isActive: false,
                },
            });
            await tx.transport.updateMany({
                where: { propertyId: id },
                data: {
                    deletedAt: now,
                    isActive: false,
                },
            });
        });
        return { success: true };
    }
    async adjustInventoryCount(id, hostId, dto) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                stays: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
                transports: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
                experiences: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!property)
            throw new common_1.NotFoundException('Listing not found');
        if (property.hostId !== hostId) {
            const user = await this.prisma.user.findUnique({ where: { id: hostId } });
            if (user?.role !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only the host can adjust inventory for this listing');
            }
        }
        if (property.type === 'STAY') {
            const stays = property.stays;
            const activeStays = stays.filter((s) => s.isActive);
            const currentActive = activeStays.length;
            let targetCount = currentActive;
            if (dto.operation === 'decrease') {
                targetCount = Math.max(0, currentActive - (dto.amount || 1));
            }
            else if (dto.operation === 'increase') {
                targetCount = currentActive + (dto.amount || 1);
            }
            else if (dto.inventoryCount !== undefined) {
                targetCount = Math.max(0, dto.inventoryCount);
            }
            else if (dto.operation === 'set' && dto.amount !== undefined) {
                targetCount = Math.max(0, dto.amount);
            }
            await this.prisma.$transaction(async (tx) => {
                if (targetCount < currentActive) {
                    const toDeactivateCount = currentActive - targetCount;
                    const toDeactivate = activeStays.slice(-toDeactivateCount);
                    for (const s of toDeactivate) {
                        await tx.stay.update({
                            where: { id: s.id },
                            data: { isActive: false },
                        });
                    }
                }
                else if (targetCount > currentActive) {
                    const needed = targetCount - currentActive;
                    const inactiveStays = stays.filter((s) => !s.isActive);
                    const reactivateCount = Math.min(needed, inactiveStays.length);
                    const toReactivate = inactiveStays.slice(0, reactivateCount);
                    for (const s of toReactivate) {
                        await tx.stay.update({
                            where: { id: s.id },
                            data: { isActive: true },
                        });
                    }
                    const stillNeeded = needed - reactivateCount;
                    if (stillNeeded > 0) {
                        const template = stays[0] || null;
                        const currentTotal = stays.length;
                        for (let i = 0; i < stillNeeded; i++) {
                            const unitIndex = currentTotal + i + 1;
                            await tx.stay.create({
                                data: {
                                    propertyId: property.id,
                                    name: `${property.name} ${unitIndex}`,
                                    roomType: template?.roomType || 'Standard Room',
                                    price: template?.price || 100000,
                                    bedrooms: template?.bedrooms || 1,
                                    beds: template?.beds || 1,
                                    baths: template?.baths || 1,
                                    maxGuests: template?.maxGuests || 2,
                                    checkInFrom: template?.checkInFrom || '14:00',
                                    checkInUntil: template?.checkInUntil || '20:00',
                                    checkOutBefore: template?.checkOutBefore || '11:00',
                                    cancellationPolicy: template?.cancellationPolicy || client_1.CancellationPolicy.MODERATE,
                                    isActive: true,
                                    sortOrder: currentTotal + i,
                                },
                            });
                        }
                    }
                }
                const draftData = property.draftData || {};
                await tx.property.update({
                    where: { id: property.id },
                    data: {
                        draftData: {
                            ...draftData,
                            inventoryCount: targetCount,
                        },
                    },
                });
            });
            return {
                id: property.id,
                propertyName: property.name,
                inventoryCount: targetCount,
                activeUnitsCount: targetCount,
                updatedAt: new Date().toISOString(),
            };
        }
        const units = property.type === 'TRANSPORT' ? property.transports : property.experiences;
        const activeUnits = units.filter((u) => u.isActive);
        const currentActive = activeUnits.length;
        let targetCount = currentActive;
        if (dto.operation === 'decrease') {
            targetCount = Math.max(0, currentActive - (dto.amount || 1));
        }
        else if (dto.operation === 'increase') {
            targetCount = currentActive + (dto.amount || 1);
        }
        else if (dto.inventoryCount !== undefined) {
            targetCount = Math.max(0, dto.inventoryCount);
        }
        else if (dto.operation === 'set' && dto.amount !== undefined) {
            targetCount = Math.max(0, dto.amount);
        }
        await this.prisma.$transaction(async (tx) => {
            if (property.type === 'TRANSPORT') {
                if (targetCount < currentActive) {
                    const toDeactivate = activeUnits.slice(-(currentActive - targetCount));
                    for (const u of toDeactivate) {
                        await tx.transport.update({ where: { id: u.id }, data: { isActive: false } });
                    }
                }
                else if (targetCount > currentActive) {
                    const inactive = units.filter((u) => !u.isActive);
                    const reactivateCount = Math.min(targetCount - currentActive, inactive.length);
                    for (const u of inactive.slice(0, reactivateCount)) {
                        await tx.transport.update({ where: { id: u.id }, data: { isActive: true } });
                    }
                }
            }
            else {
                if (targetCount < currentActive) {
                    const toDeactivate = activeUnits.slice(-(currentActive - targetCount));
                    for (const u of toDeactivate) {
                        await tx.experience.update({ where: { id: u.id }, data: { isActive: false } });
                    }
                }
                else if (targetCount > currentActive) {
                    const inactive = units.filter((u) => !u.isActive);
                    const reactivateCount = Math.min(targetCount - currentActive, inactive.length);
                    for (const u of inactive.slice(0, reactivateCount)) {
                        await tx.experience.update({ where: { id: u.id }, data: { isActive: true } });
                    }
                }
            }
            const draftData = property.draftData || {};
            await tx.property.update({
                where: { id: property.id },
                data: {
                    draftData: {
                        ...draftData,
                        inventoryCount: targetCount,
                    },
                },
            });
        });
        return {
            id: property.id,
            propertyName: property.name,
            inventoryCount: targetCount,
            activeUnitsCount: targetCount,
            updatedAt: new Date().toISOString(),
        };
    }
    async updatePropertyPricing(id, hostId, dto) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                stays: { where: { deletedAt: null } },
                experiences: { where: { deletedAt: null } },
                transports: { where: { deletedAt: null } },
            },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        if (property.hostId !== hostId) {
            const user = await this.prisma.user.findUnique({ where: { id: hostId } });
            if (user?.role !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only the host can update pricing for this listing');
            }
        }
        const newPriceNgwee = dto.pricePerUnitNgwee;
        const currency = dto.currency || property.currency || 'ZMW';
        await this.prisma.$transaction(async (tx) => {
            const draftData = property.draftData || {};
            await tx.property.update({
                where: { id },
                data: {
                    currency,
                    draftData: {
                        ...draftData,
                        pricePerUnitNgwee: newPriceNgwee,
                    },
                },
            });
            if (property.type === 'STAY') {
                await tx.stay.updateMany({
                    where: { propertyId: id, deletedAt: null },
                    data: { price: newPriceNgwee },
                });
            }
            else if (property.type === 'EXPERIENCE') {
                await tx.experience.updateMany({
                    where: { propertyId: id, deletedAt: null },
                    data: { price: newPriceNgwee },
                });
            }
            else if (property.type === 'TRANSPORT') {
                await tx.transport.updateMany({
                    where: { propertyId: id, deletedAt: null },
                    data: { pricePerSeat: newPriceNgwee },
                });
            }
        });
        return {
            propertyId: property.id,
            propertyName: property.name,
            pricePerUnitNgwee: newPriceNgwee,
            currency,
            historicalBookingsPreserved: true,
            updatedAt: new Date().toISOString(),
        };
    }
    async updatePropertyPolicies(propertyId, hostId, dto) {
        const property = await this.assertOwnership(propertyId, hostId);
        const existingDraft = property.draftData && typeof property.draftData === 'object'
            ? property.draftData
            : {};
        const updatedDraft = {
            ...existingDraft,
            policies: JSON.parse(JSON.stringify(dto)),
        };
        const updated = await this.prisma.property.update({
            where: { id: propertyId },
            data: {
                draftData: updatedDraft,
            },
            include: {
                rules: true,
                stays: true,
            },
        });
        let cancellationEnum = null;
        if (dto.cancellation?.tier) {
            const tierUpper = dto.cancellation.tier.toUpperCase();
            if (['FLEXIBLE', 'MODERATE', 'STRICT'].includes(tierUpper)) {
                cancellationEnum = tierUpper;
            }
            else {
                cancellationEnum = client_1.CancellationPolicy.MODERATE;
            }
        }
        if (dto.schedule || cancellationEnum) {
            await this.prisma.stay.updateMany({
                where: { propertyId },
                data: {
                    ...(cancellationEnum ? { cancellationPolicy: cancellationEnum } : {}),
                    ...(dto.schedule?.checkInFrom ? { checkInFrom: dto.schedule.checkInFrom } : {}),
                    ...(dto.schedule?.checkInUntil ? { checkInUntil: dto.schedule.checkInUntil } : {}),
                    ...(dto.schedule?.checkOutBefore ? { checkOutBefore: dto.schedule.checkOutBefore } : {}),
                },
            });
        }
        if (dto.houseRules?.customRules && Array.isArray(dto.houseRules.customRules)) {
            await this.prisma.propertyRule.deleteMany({ where: { propertyId } });
            if (dto.houseRules.customRules.length > 0) {
                await this.prisma.propertyRule.createMany({
                    data: dto.houseRules.customRules.map((r) => ({
                        propertyId,
                        rule: r,
                    })),
                });
            }
        }
        const tier = dto.cancellation?.tier || 'moderate';
        const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1);
        const refundPercent = dto.cancellation?.refundPercentagePriorToCutOff ?? 100;
        const cutOffDays = Math.round((dto.cancellation?.freeCancellationCutOffHours || 120) / 24);
        const cancellationSummary = `${tierCapitalized} (${refundPercent}% refund up to ${cutOffDays} days before check-in)`;
        let rulesCount = (dto.houseRules?.customRules?.length || 0);
        if (dto.houseRules) {
            if (!dto.houseRules.smokingAllowed)
                rulesCount++;
            if (!dto.houseRules.petsAllowed)
                rulesCount++;
            if (!dto.houseRules.partiesOrEventsAllowed)
                rulesCount++;
            if (dto.houseRules.quietHours?.enabled)
                rulesCount++;
        }
        const depositRequired = !!dto.securityDeposit?.required;
        const responseData = {
            propertyId: updated.id,
            updatedAt: updated.updatedAt.toISOString(),
            cancellationSummary,
            rulesCount: Math.max(1, rulesCount),
            depositRequired,
        };
        return {
            success: true,
            message: 'Property policies updated successfully.',
            data: responseData,
            ...responseData,
        };
    }
    async getPropertyPolicies(propertyOrListingId) {
        let property = await this.prisma.property.findUnique({
            where: { id: propertyOrListingId },
            include: {
                stays: { take: 1, orderBy: { sortOrder: 'asc' } },
                rules: true,
            },
        });
        if (!property) {
            const stay = await this.prisma.stay.findUnique({
                where: { id: propertyOrListingId },
                include: {
                    property: {
                        include: {
                            stays: { take: 1, orderBy: { sortOrder: 'asc' } },
                            rules: true,
                        },
                    },
                },
            });
            if (stay) {
                property = stay.property;
            }
        }
        if (!property) {
            throw new common_1.NotFoundException(`Property or listing "${propertyOrListingId}" not found`);
        }
        const stored = property.draftData?.policies || {};
        const primaryStay = property.stays?.[0];
        const tier = (stored.cancellation?.tier || primaryStay?.cancellationPolicy?.toLowerCase() || 'moderate');
        const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1);
        const deadlineHours = stored.cancellation?.freeCancellationCutOffHours || 120;
        const deadlineDate = new Date(Date.now() + deadlineHours * 3600 * 1000).toISOString();
        const cancellation = {
            tier,
            headline: `${tierCapitalized} cancellation policy`,
            description: stored.cancellation?.customText ||
                (tier === 'flexible'
                    ? 'Full refund up to 24 hours before check-in.'
                    : tier === 'strict'
                        ? 'Full refund up to 7 days before check-in. No refund after cutoff.'
                        : 'Full refund up to 5 days before check-in. Cancellations made within 5 days of arrival receive a 50% refund minus transaction fees.'),
            freeCancellationDeadline: deadlineDate,
        };
        const checkInFrom = stored.schedule?.checkInFrom || primaryStay?.checkInFrom || '14:00';
        const checkInUntil = stored.schedule?.checkInUntil || primaryStay?.checkInUntil || '21:00';
        const checkOutBefore = stored.schedule?.checkOutBefore || primaryStay?.checkOutBefore || '10:30';
        const houseRulesSummary = [];
        if (stored.houseRules) {
            if (!stored.houseRules.smokingAllowed)
                houseRulesSummary.push('No smoking indoors');
            if (!stored.houseRules.petsAllowed)
                houseRulesSummary.push('No pets allowed');
            if (!stored.houseRules.partiesOrEventsAllowed)
                houseRulesSummary.push('No parties or events');
            if (stored.houseRules.quietHours?.enabled) {
                houseRulesSummary.push(`Quiet hours: ${stored.houseRules.quietHours.startTime} – ${stored.houseRules.quietHours.endTime}`);
            }
            if (Array.isArray(stored.houseRules.customRules)) {
                houseRulesSummary.push(...stored.houseRules.customRules);
            }
        }
        else if (property.rules?.length) {
            houseRulesSummary.push(...property.rules.map((r) => r.rule));
        }
        else {
            houseRulesSummary.push('No smoking indoors', 'No pets allowed', 'No parties or events', 'Quiet hours: 22:00 – 06:30');
        }
        const depositAmount = stored.securityDeposit?.amountNgwee ?? 75000;
        const depositTimeline = stored.securityDeposit?.refundTimelineHours ?? 48;
        const securityDepositNote = stored.securityDeposit?.required !== false
            ? `A refundable security deposit of K${(depositAmount / 100).toFixed(2)} will be held and released within ${depositTimeline} hours of checkout.`
            : 'No security deposit required.';
        const goodToKnow = stored.goodToKnow?.customPoliciesText ||
            'Lodge operates on 24-hour solar inverter. High-wattage hair dryers are not supported. Borehole water is UV-filtered and safe for brushing teeth; complimentary bottled mineral water provided in chalets.';
        const responseData = {
            propertyId: property.id,
            title: property.name,
            cancellation,
            checkInWindow: `${checkInFrom} – ${checkInUntil}`,
            checkOutBefore,
            houseRulesSummary,
            securityDepositNote,
            goodToKnow,
        };
        return {
            success: true,
            data: responseData,
            ...responseData,
        };
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = PropertiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map