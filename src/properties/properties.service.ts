import {
  UpdatePropertyPoliciesDto,
  CancellationTier,
} from '../policies/dto/policy.dto';
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import {
  UpdatePropertyDto,
  UpdatePropertyPricingDto,
  UpdatePropertyPricingResponseDto,
} from './dto/update-property.dto';
import { CreateStayDto, UpdateStayDto } from './dto/create-stay.dto';
import {
  CreateExperienceDto,
  UpdateExperienceDto,
} from './dto/create-experience.dto';
import {
  CreateTransportDto,
  UpdateTransportDto,
} from './dto/create-transport.dto';
import {
  CreateListingPolicyDto,
  UpdateListingPolicyDto,
  SetListingPoliciesDto,
  ListingPolicyCategoryEnum,
} from './dto/listing-policy.dto';
import {
  CreateListingTagDto,
  CreateListingRecommendationDto,
  ListingFilterQueryDto,
  TagCategoryEnum,
  RecommendationAudienceEnum,
} from './dto/listing-tag-recommendation.dto';
import {
  ListingPolicyCategory,
  TagCategory,
  RecommendationAudience,
  PropertyStatus,
  PropertyType,
  CancellationPolicy,
} from '@prisma/client';
import {
  CreateUnifiedListingDto,
  CreateUnifiedListingResponseDto,
  UpdateListingStatusResponseDto,
  DeleteListingResponseDto,
  AdjustInventoryDto,
  AdjustInventoryResponseDto,
} from './dto/create-listing-unified.dto';

export function toTagSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTagsData(
  tags: any[],
  foreignKey: {
    propertyId?: string;
    stayId?: string;
    experienceId?: string;
    transportId?: string;
  },
) {
  return tags.map((t) => {
    const isObj = typeof t === 'object' && t !== null;
    const name = (isObj ? t.name : String(t)).trim();
    const category = (
      isObj && t.category ? t.category : TagCategory.CATEGORY
    ) as TagCategory;
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

function parseRecsData(
  recs: any[],
  foreignKey: {
    propertyId?: string;
    stayId?: string;
    experienceId?: string;
    transportId?: string;
  },
) {
  return recs.map((r, i) => ({
    ...foreignKey,
    audience: (r.audience ||
      RecommendationAudience.GENERAL) as RecommendationAudience,
    title: r.title,
    reason: r.reason || null,
    badge: r.badge || null,
    sortOrder: r.sortOrder ?? i,
  }));
}

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Full include helper ──────────────────────────────────────────────────────

  private readonly fullInclude = {
    host: {
      select: {
        id: true,
        name: true,
        avatar: true,
        hostProfile: {
          select: {
            businessName: true,
            defaultCheckInTime: true,
            defaultCheckOutTime: true,
          },
        },
      },
    },
    stays: {
      where: { deletedAt: null },
      orderBy: { rate: 'asc' as const },
      include: {
        policies: { orderBy: { sortOrder: 'asc' as const } },
        tags: { orderBy: { createdAt: 'asc' as const } },
        recommendations: { orderBy: { sortOrder: 'asc' as const } },
      },
    },
    experiences: {
      where: { deletedAt: null },
      orderBy: { rate: 'asc' as const },
      include: {
        slots: { orderBy: { startTime: 'asc' as const } },
        inclusions: true,
        policies: { orderBy: { sortOrder: 'asc' as const } },
        tags: { orderBy: { createdAt: 'asc' as const } },
        recommendations: { orderBy: { sortOrder: 'asc' as const } },
      },
    },
    transports: {
      where: { deletedAt: null },
      orderBy: { rate: 'asc' as const },
      include: {
        policies: { orderBy: { sortOrder: 'asc' as const } },
        tags: { orderBy: { createdAt: 'asc' as const } },
        recommendations: { orderBy: { sortOrder: 'asc' as const } },
      },
    },
    images: { orderBy: { sortOrder: 'asc' as const } },
    amenities: { orderBy: { name: 'asc' as const } },
    rules: true,
    tags: { orderBy: { createdAt: 'asc' as const } },
    recommendations: { orderBy: { sortOrder: 'asc' as const } },
    reviews: { select: { rating: true } },
    _count: { select: { reviews: true, bookings: true } },
  } as const;

  // ── Property (Business level) CRUD ──────────────────────────────────────────

  async createProperty(hostId: string, dto: CreatePropertyDto) {
    const status =
      dto.isDraft || dto.status === PropertyStatus.DRAFT
        ? PropertyStatus.DRAFT
        : dto.status || PropertyStatus.ACTIVE;

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
          draftStep:
            dto.draftStep || (status === PropertyStatus.DRAFT ? 1 : null),
          draftData: dto.draftData
            ? JSON.parse(JSON.stringify(dto.draftData))
            : undefined,
          images: dto.images?.length
            ? {
                createMany: {
                  data: dto.images.map((url, i) => ({ url, sortOrder: i })),
                },
              }
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

  async update(id: string, hostId: string, dto: UpdatePropertyDto) {
    await this.assertOwnership(id, hostId);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.draftStep !== undefined) data.draftStep = dto.draftStep;
    if (dto.draftData !== undefined)
      data.draftData = dto.draftData
        ? JSON.parse(JSON.stringify(dto.draftData))
        : null;

    if (dto.isDraft !== undefined) {
      data.status = dto.isDraft ? PropertyStatus.DRAFT : PropertyStatus.ACTIVE;
    } else if (dto.status !== undefined) {
      data.status = dto.status;
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data,
      include: this.fullInclude,
    });

    return this.formatProperty(updated);
  }

  async remove(id: string, hostId: string) {
    await this.assertOwnership(id, hostId);
    await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
    return { id, deleted: true };
  }

  // ── Stays Unit CRUD ──────────────────────────────────────────────────────────

  async addStay(propertyId: string, hostId: string, dto: CreateStayDto) {
    const property = await this.assertOwnership(propertyId, hostId);
    if (property.type !== 'STAY') {
      throw new BadRequestException(
        'Cannot add a stay unit to a non-stay property',
      );
    }

    const stay = await this.prisma.$transaction(async (tx) => {
      const s = await tx.stay.create({
        data: {
          propertyId,
          name: dto.name,
          description: dto.description || null,
          rate: (dto as any).rate || (dto as any).price || 0,
          unitType:
            (dto as any).unitType || (dto as any).roomType || 'STANDARD_ROOM',
          isActive: dto.isActive ?? true,
        },
      });

      // Automatically create the initial capacity inventory ledger
      await tx.stayInventory.create({
        data: {
          stayId: s.id,
          total: (dto as any).totalUnits || (dto as any).capacity || 1,
          available: (dto as any).totalUnits || (dto as any).capacity || 1,
          booked: 0,
        },
      });
      if (dto.policies?.length) {
        await tx.listingPolicy.createMany({
          data: dto.policies.map((p, i) => ({
            stayId: s.id,
            category: p.category as unknown as ListingPolicyCategory,
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

  async listStays(propertyId: string) {
    return this.prisma.stay.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { rate: 'asc' },
    });
  }

  async updateStay(
    propertyId: string,
    stayId: string,
    hostId: string,
    dto: UpdateStayDto,
  ) {
    await this.assertOwnership(propertyId, hostId);
    const stay = await this.prisma.stay.findFirst({
      where: { id: stayId, propertyId },
    });
    if (!stay) throw new NotFoundException('Stay unit not found');

    const updated = await this.prisma.stay.update({
      where: { id: stayId },
      data: {
        name: dto.name,
        description: dto.description,
        rate: (dto as any).rate || (dto as any).price,
        unitType: (dto as any).unitType || (dto as any).roomType,
        isActive: dto.isActive,
      },
    });

    return { propertyId, stay: updated };
  }

  async removeStay(propertyId: string, stayId: string, hostId: string) {
    await this.assertOwnership(propertyId, hostId);
    await this.prisma.stay.update({
      where: { id: stayId },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { propertyId, stayId, deleted: true };
  }

  // ── Experiences Unit CRUD ────────────────────────────────────────────────────

  async addExperience(
    propertyId: string,
    hostId: string,
    dto: CreateExperienceDto,
  ) {
    const property = await this.assertOwnership(propertyId, hostId);
    if (property.type !== 'EXPERIENCE') {
      throw new BadRequestException(
        'Cannot add an experience unit to a non-experience property',
      );
    }

    const inclusions = dto.inclusions?.length
      ? dto.inclusions
      : dto.whatsIncluded?.length
        ? dto.whatsIncluded
        : [];
    const timeSlots = dto.timeSlots?.length
      ? dto.timeSlots
      : dto.slots?.length
        ? dto.slots
        : [];
    const whatsNotIncluded = dto.whatsNotIncluded || dto.exclusions || [];
    const whatToBring = dto.whatToBring || dto.whatToCarry || [];
    const whatNotToBring = dto.whatNotToBring || [];
    const importantInformation =
      dto.importantInformation || dto.guidelines || [];
    const notSuitableFor = dto.notSuitableFor || dto.suitability || [];

    const exp = await this.prisma.$transaction(async (tx) => {
      const e = await tx.experience.create({
        data: {
          propertyId,
          name: dto.name,
          description: dto.description || null,
          rate: (dto as any).rate || (dto as any).price || 0,
          experienceType:
            (dto as any).experienceType || (dto as any).activityType || 'OTHER',
          meetingPoint: dto.meetingPoint || null,
          meetingPointAddress:
            dto.meetingPointAddress || dto.meetingPoint || null,
          whatsNotIncluded,
          whatToBring,
          whatNotToBring,
          importantInformation,
          notSuitableFor,
          isActive: dto.isActive ?? true,
          inclusions: inclusions.length
            ? { createMany: { data: inclusions.map((item) => ({ item })) } }
            : undefined,
        },
      });

      // Create initial time slot (e.g., 10:00 - 13:00)
      const slotTime = timeSlots[0] || '10:00 - 13:00';
      const parts =
        typeof slotTime === 'string' && slotTime.includes('-')
          ? slotTime.split('-').map((s) => s.trim())
          : ['10:00', '13:00'];

      await tx.experienceSlot.create({
        data: {
          experienceId: e.id,
          startTime: parts[0] || '10:00',
          endTime: parts[1] || '13:00',
          label:
            typeof slotTime === 'string' ? slotTime : 'Morning Slot (10-13hrs)',
          maxCapacity: dto.maxParticipants || 10,
          available: dto.maxParticipants || 10,
          booked: 0,
        },
      });
      if (dto.policies?.length) {
        await tx.listingPolicy.createMany({
          data: dto.policies.map((p, i) => ({
            experienceId: e.id,
            category: p.category as unknown as ListingPolicyCategory,
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
          slots: { orderBy: { startTime: 'asc' } },
          inclusions: true,
          policies: { orderBy: { sortOrder: 'asc' } },
          tags: { orderBy: { createdAt: 'asc' } },
          recommendations: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });

    return { propertyId, experience: exp };
  }

  async listExperiences(propertyId: string) {
    return this.prisma.experience.findMany({
      where: { propertyId, deletedAt: null },
      include: {
        slots: { orderBy: { startTime: 'asc' } },
        inclusions: true,
      },
      orderBy: { rate: 'asc' },
    });
  }

  async updateExperience(
    propertyId: string,
    experienceId: string,
    hostId: string,
    dto: UpdateExperienceDto,
  ) {
    await this.assertOwnership(propertyId, hostId);
    const exp = await this.prisma.experience.findFirst({
      where: { id: experienceId, propertyId },
    });
    if (!exp) throw new NotFoundException('Experience unit not found');

    const { timeSlots, inclusions, ...data } = dto;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (timeSlots) {
        await tx.experienceSlot.deleteMany({ where: { experienceId } });
        if (timeSlots.length) {
          await tx.experienceSlot.createMany({
            data: timeSlots.map((slotTime) => {
              const parts =
                typeof slotTime === 'string' && slotTime.includes('-')
                  ? slotTime.split('-').map((s) => s.trim())
                  : [slotTime, '13:00'];
              return {
                experienceId,
                startTime: parts[0] || '10:00',
                endTime: parts[1] || '13:00',
                label:
                  typeof slotTime === 'string'
                    ? slotTime
                    : 'Morning Slot (10-13hrs)',
                maxCapacity: (data as any).maxParticipants || 10,
                available: (data as any).maxParticipants || 10,
                booked: 0,
              };
            }),
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
        data: {
          name: (data as any).name,
          description: (data as any).description,
          rate: (data as any).rate || (data as any).price,
          experienceType:
            (data as any).experienceType || (data as any).activityType,
          meetingPoint: (data as any).meetingPoint,
          isActive: (data as any).isActive,
        },
        include: {
          slots: { orderBy: { startTime: 'asc' } },
          inclusions: true,
        },
      });
    });

    return { propertyId, experience: updated };
  }

  async removeExperience(
    propertyId: string,
    experienceId: string,
    hostId: string,
  ) {
    await this.assertOwnership(propertyId, hostId);
    await this.prisma.experience.update({
      where: { id: experienceId },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { propertyId, experienceId, deleted: true };
  }

  // ── Transport Unit CRUD ──────────────────────────────────────────────────────

  async addTransport(
    propertyId: string,
    hostId: string,
    dto: CreateTransportDto,
  ) {
    const property = await this.assertOwnership(propertyId, hostId);
    if (property.type !== 'TRANSPORT') {
      throw new BadRequestException(
        'Cannot add a transport unit to a non-transport property',
      );
    }

    const transport = await this.prisma.$transaction(async (tx) => {
      const t = await tx.transport.create({
        data: {
          propertyId,
          name: dto.name,
          description: dto.description || null,
          from: dto.from || null,
          to: dto.to || null,
          rentalType: (dto as any).rentalType || null,
          routeType: (dto as any).routeType || null,
          vehicleType: dto.vehicleType || null,
          rate: (dto as any).rate || (dto as any).pricePerSeat || 0,
          tripType: (dto as any).tripType || 'ONE_WAY',
          isActive: dto.isActive ?? true,
        },
      });

      // Create capacity inventory
      await tx.transportInventory.create({
        data: {
          transportId: t.id,
          totalSeats: dto.capacity || 1,
          available: dto.capacity || 1,
          booked: 0,
        },
      });
      if (dto.policies?.length) {
        await tx.listingPolicy.createMany({
          data: dto.policies.map((p, i) => ({
            transportId: t.id,
            category: p.category as unknown as ListingPolicyCategory,
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

  async listTransports(propertyId: string) {
    return this.prisma.transport.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { rate: 'asc' },
    });
  }

  async updateTransport(
    propertyId: string,
    transportId: string,
    hostId: string,
    dto: UpdateTransportDto,
  ) {
    await this.assertOwnership(propertyId, hostId);
    const transport = await this.prisma.transport.findFirst({
      where: { id: transportId, propertyId },
    });
    if (!transport) throw new NotFoundException('Transport unit not found');

    const updated = await this.prisma.transport.update({
      where: { id: transportId },
      data: {
        name: dto.name,
        description: dto.description,
        from: dto.from,
        to: dto.to,
        vehicleType: dto.vehicleType,
        rentalType: (dto as any).rentalType,
        routeType: (dto as any).routeType,
        rate: (dto as any).rate || (dto as any).pricePerSeat,
        isActive: dto.isActive,
      },
    });

    return { propertyId, transport: updated };
  }

  async removeTransport(
    propertyId: string,
    transportId: string,
    hostId: string,
  ) {
    await this.assertOwnership(propertyId, hostId);
    await this.prisma.transport.update({
      where: { id: transportId },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { propertyId, transportId, deleted: true };
  }

  // ── Images, Amenities, Rules ─────────────────────────────────────────────────

  async addImages(id: string, hostId: string, imageUrls: string[]) {
    await this.assertOwnership(id, hostId);

    const maxSort = await this.prisma.propertyImage.findFirst({
      where: { propertyId: id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const baseOrder = (maxSort?.sortOrder ?? -1) + 1;

    await this.prisma.propertyImage.createMany({
      data: imageUrls.map((url, i) => ({
        propertyId: id,
        url,
        sortOrder: baseOrder + i,
      })),
    });

    const images = await this.prisma.propertyImage.findMany({
      where: { propertyId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      id,
      images: images.map((img) => ({ url: img.url, sortOrder: img.sortOrder })),
    };
  }

  async removeImage(id: string, hostId: string, imageUrl: string) {
    await this.assertOwnership(id, hostId);
    await this.prisma.propertyImage.deleteMany({
      where: { propertyId: id, url: imageUrl },
    });
    const images = await this.prisma.propertyImage.findMany({
      where: { propertyId: id },
      orderBy: { sortOrder: 'asc' },
    });
    return {
      id,
      images: images.map((img) => ({ url: img.url, sortOrder: img.sortOrder })),
    };
  }

  async addAmenity(id: string, hostId: string, name: string, icon?: string) {
    await this.assertOwnership(id, hostId);
    const amenity = await this.prisma.propertyAmenity.upsert({
      where: { propertyId_name: { propertyId: id, name } },
      create: { propertyId: id, name, icon: icon || null },
      update: { icon: icon || null },
    });
    return { id, amenity };
  }

  async removeAmenity(id: string, hostId: string, amenityId: string) {
    await this.assertOwnership(id, hostId);
    await this.prisma.propertyAmenity.delete({ where: { id: amenityId } });
    return { id, deleted: true };
  }

  async addRule(id: string, hostId: string, rule: string) {
    await this.assertOwnership(id, hostId);
    const ruleObj = await this.prisma.propertyRule.create({
      data: { propertyId: id, rule },
    });
    return { id, rule: ruleObj };
  }

  async removeRule(id: string, hostId: string, ruleId: string) {
    await this.assertOwnership(id, hostId);
    await this.prisma.propertyRule.delete({ where: { id: ruleId } });
    return { id, deleted: true };
  }

  // ── Reads & Drafts ──────────────────────────────────────────────────────────

  async findByHost(hostId: string, status?: PropertyStatus) {
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

  /** Get all draft listings for a host so they can finish up later. */
  async findDraftsByHost(hostId: string) {
    const drafts = await this.prisma.property.findMany({
      where: {
        hostId,
        status: PropertyStatus.DRAFT,
        deletedAt: null,
      },
      include: this.fullInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return drafts.map((d) => this.formatProperty(d));
  }

  /** Get a single draft listing for a host to continue editing in the wizard. */
  async findDraftById(id: string, hostId: string) {
    await this.assertOwnership(id, hostId);
    const draft = await this.prisma.property.findUnique({
      where: { id },
      include: this.fullInclude,
    });
    if (!draft || draft.deletedAt)
      throw new NotFoundException('Draft listing not found');
    return this.formatProperty(draft);
  }

  /** Save new listing as draft (Save & Exit). */
  async saveDraft(hostId: string, dto: CreatePropertyDto) {
    return this.createProperty(hostId, {
      ...dto,
      isDraft: true,
      status: PropertyStatus.DRAFT,
    });
  }

  /** Update an existing draft listing. */
  async updateDraft(
    propertyId: string,
    hostId: string,
    dto: UpdatePropertyDto,
  ) {
    return this.update(propertyId, hostId, {
      ...dto,
      isDraft: true,
      status: PropertyStatus.DRAFT,
    });
  }

  /**
   * Publish a draft listing.
   * Validates required completeness (name, description, location, images, at least 1 unit).
   * Transitions status from DRAFT to ACTIVE and clears draftStep.
   */
  async publishListing(propertyId: string, hostId: string) {
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

    if (!property) throw new NotFoundException('Listing not found');

    const errors: string[] = [];
    if (!property.name || !property.name.trim())
      errors.push('Listing name is required.');
    if (!property.description || !property.description.trim())
      errors.push('Listing description is required.');
    if (!property.location || !property.location.trim())
      errors.push('Listing location is required.');
    if (!property.images || property.images.length === 0)
      errors.push('At least one photo is required to publish.');

    const unitCount =
      (property.stays?.length || 0) +
      (property.experiences?.length || 0) +
      (property.transports?.length || 0);

    if (unitCount === 0) {
      errors.push(
        `At least one bookable ${property.type.toLowerCase()} unit must be added before publishing.`,
      );
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Cannot publish incomplete listing draft.',
        errors,
      });
    }

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        status: PropertyStatus.ACTIVE,
        draftStep: null,
      },
      include: this.fullInclude,
    });

    return this.formatProperty(updated);
  }

  /**
   * Save wizard stage data when host clicks "Next" on the frontend.
   * Updates partial data, advances draftStep, and handles step-specific relations.
   */
  async saveWizardStep(
    propertyId: string,
    hostId: string,
    step: number,
    payload: any,
  ) {
    await this.assertOwnership(propertyId, hostId);

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { stays: true, experiences: true, transports: true },
    });
    if (!property) throw new NotFoundException('Property not found');

    const updateData: any = {
      draftStep: Math.max(step + 1, property.draftStep || 1),
    };

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description;
    if (payload.location !== undefined) updateData.location = payload.location;
    if (payload.currency !== undefined) updateData.currency = payload.currency;
    if (payload.draftData !== undefined) {
      updateData.draftData = payload.draftData
        ? JSON.parse(JSON.stringify(payload.draftData))
        : null;
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Update basic property attributes
      await tx.property.update({
        where: { id: propertyId },
        data: updateData,
      });

      // 2. Images (if submitted in this step)
      if (payload.images && Array.isArray(payload.images)) {
        await tx.propertyImage.deleteMany({ where: { propertyId } });
        if (payload.images.length > 0) {
          await tx.propertyImage.createMany({
            data: payload.images.map((url: string, i: number) => ({
              propertyId,
              url,
              sortOrder: i,
            })),
          });
        }
      }

      // 3. Amenities (if submitted in this step)
      if (payload.amenities && Array.isArray(payload.amenities)) {
        await tx.propertyAmenity.deleteMany({ where: { propertyId } });
        if (payload.amenities.length > 0) {
          await tx.propertyAmenity.createMany({
            data: payload.amenities.map((name: string) => ({
              propertyId,
              name,
            })),
          });
        }
      }

      // 4. Rules (if submitted in this step)
      if (payload.rules && Array.isArray(payload.rules)) {
        await tx.propertyRule.deleteMany({ where: { propertyId } });
        if (payload.rules.length > 0) {
          await tx.propertyRule.createMany({
            data: payload.rules.map((rule: string) => ({ propertyId, rule })),
          });
        }
      }

      // 5. Tags (if submitted in this step)
      if (payload.tags && Array.isArray(payload.tags)) {
        await tx.listingTag.deleteMany({ where: { propertyId } });
        if (payload.tags.length > 0) {
          await tx.listingTag.createMany({
            data: parseTagsData(payload.tags, { propertyId }),
          });
        }
      }

      // 6. Recommendations (if submitted in this step)
      if (payload.recommendations && Array.isArray(payload.recommendations)) {
        await tx.listingRecommendation.deleteMany({ where: { propertyId } });
        if (payload.recommendations.length > 0) {
          await tx.listingRecommendation.createMany({
            data: parseRecsData(payload.recommendations, { propertyId }),
          });
        }
      }

      // 7. Stay Unit (if submitted in this step for STAY type)
      let primaryStayId = property.stays?.[0]?.id;
      if (property.type === 'STAY' && (payload.stay || payload.stays)) {
        const stayList = payload.stays || [payload.stay];
        for (const s of stayList) {
          if (!s) continue;
          if (primaryStayId) {
            await tx.stay.update({
              where: { id: primaryStayId },
              data: {
                name: s.name ?? undefined,
                description: s.description ?? undefined,
                rate: (s.rate !== undefined ? s.rate : s.price) ?? undefined,
                unitType: s.unitType ?? s.roomType ?? undefined,
              },
            });
          } else if (s.name) {
            const createdStay = await tx.stay.create({
              data: {
                propertyId,
                name: s.name,
                description: s.description || null,
                rate: (s.rate !== undefined ? s.rate : s.price) || 0,
                unitType: s.unitType || s.roomType || 'STANDARD_ROOM',
              },
            });
            await tx.stayInventory.create({
              data: {
                stayId: createdStay.id,
                total: s.totalUnits || s.capacity || 1,
                available: s.totalUnits || s.capacity || 1,
                booked: 0,
              },
            });
            primaryStayId = createdStay.id;
          }
        }
      }

      // 8. Experience Unit (if submitted in this step for EXPERIENCE type)
      let primaryExpId = property.experiences?.[0]?.id;
      if (
        property.type === 'EXPERIENCE' &&
        (payload.experience || payload.experiences)
      ) {
        const expList = payload.experiences || [payload.experience];
        for (const e of expList) {
          if (!e) continue;
          if (primaryExpId) {
            await tx.experience.update({
              where: { id: primaryExpId },
              data: {
                name: e.name ?? undefined,
                description: e.description ?? undefined,
                rate: (e.rate !== undefined ? e.rate : e.price) ?? undefined,
                experienceType: e.experienceType ?? e.activityType ?? undefined,
                meetingPoint: e.meetingPoint ?? undefined,
              },
            });
          } else if (e.name) {
            const createdExp = await tx.experience.create({
              data: {
                propertyId,
                name: e.name,
                description: e.description || null,
                rate: (e.rate !== undefined ? e.rate : e.price) || 0,
                experienceType: e.experienceType || e.activityType || 'OTHER',
                meetingPoint: e.meetingPoint || null,
              },
            });
            await tx.experienceSlot.create({
              data: {
                experienceId: createdExp.id,
                startTime: '10:00',
                endTime: '13:00',
                label: 'Morning Slot (10-13hrs)',
                maxCapacity: e.maxParticipants || 10,
                available: e.maxParticipants || 10,
                booked: 0,
              },
            });
            primaryExpId = createdExp.id;
          }
        }
      }

      // 9. Transport Unit (if submitted in this step for TRANSPORT type)
      let primaryTransId = property.transports?.[0]?.id;
      if (
        property.type === 'TRANSPORT' &&
        (payload.transport || payload.transports)
      ) {
        const transList = payload.transports || [payload.transport];
        for (const t of transList) {
          if (!t) continue;
          if (primaryTransId) {
            await tx.transport.update({
              where: { id: primaryTransId },
              data: {
                name: t.name ?? undefined,
                description: t.description ?? undefined,
                from: t.from ?? undefined,
                to: t.to ?? undefined,
                vehicleType: t.vehicleType ?? undefined,
                rate:
                  (t.rate !== undefined ? t.rate : t.pricePerSeat) ?? undefined,
                rentalType: t.rentalType ?? undefined,
                routeType: t.routeType ?? undefined,
              },
            });
          } else if (t.name) {
            const createdTrans = await tx.transport.create({
              data: {
                propertyId,
                name: t.name,
                description: t.description || null,
                from: t.from || null,
                to: t.to || null,
                vehicleType: t.vehicleType || null,
                rate: (t.rate !== undefined ? t.rate : t.pricePerSeat) || 0,
                rentalType: t.rentalType || null,
                routeType: t.routeType || null,
              },
            });
            await tx.transportInventory.create({
              data: {
                transportId: createdTrans.id,
                totalSeats: t.capacity || 1,
                available: t.capacity || 1,
                booked: 0,
              },
            });
            primaryTransId = createdTrans.id;
          }
        }
      }

      // 10. Listing Policies (if submitted in this step)
      if (payload.policies && Array.isArray(payload.policies)) {
        const targetStayId = primaryStayId || property.stays?.[0]?.id;
        const targetExpId = primaryExpId || property.experiences?.[0]?.id;
        const targetTransId = primaryTransId || property.transports?.[0]?.id;

        if (targetStayId) {
          await tx.listingPolicy.deleteMany({
            where: { stayId: targetStayId },
          });
          if (payload.policies.length > 0) {
            await tx.listingPolicy.createMany({
              data: payload.policies.map((p: any, i: number) => ({
                stayId: targetStayId,
                category: p.category || 'OTHER',
                title: p.title,
                body: p.body,
                sortOrder: p.sortOrder ?? i,
              })),
            });
          }
        } else if (targetExpId) {
          await tx.listingPolicy.deleteMany({
            where: { experienceId: targetExpId },
          });
          if (payload.policies.length > 0) {
            await tx.listingPolicy.createMany({
              data: payload.policies.map((p: any, i: number) => ({
                experienceId: targetExpId,
                category: p.category || 'OTHER',
                title: p.title,
                body: p.body,
                sortOrder: p.sortOrder ?? i,
              })),
            });
          }
        } else if (targetTransId) {
          await tx.listingPolicy.deleteMany({
            where: { transportId: targetTransId },
          });
          if (payload.policies.length > 0) {
            await tx.listingPolicy.createMany({
              data: payload.policies.map((p: any, i: number) => ({
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

  async findOneFromDb(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: this.fullInclude,
    });
    if (!property || property.deletedAt)
      throw new NotFoundException('Property not found');
    return this.formatProperty(property);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  public formatProperty(property: any) {
    const ratings = property.reviews?.map((r: any) => r.rating) || [];
    const avgRating = ratings.length
      ? Number(
          (
            ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          ).toFixed(1),
        )
      : 0;

    let startingPrice = 0;
    if (property.type === 'STAY' && property.stays?.length) {
      const active = property.stays.filter((s: any) => s.isActive);
      if (active.length)
        startingPrice = Math.min(...active.map((s: any) => s.rate));
    } else if (property.type === 'EXPERIENCE' && property.experiences?.length) {
      const active = property.experiences.filter((e: any) => e.isActive);
      if (active.length)
        startingPrice = Math.min(...active.map((e: any) => e.rate));
    } else if (property.type === 'TRANSPORT' && property.transports?.length) {
      const active = property.transports.filter(
        (t: any) => t.isActive && t.rate != null,
      );
      if (active.length)
        startingPrice = Math.min(...active.map((t: any) => t.rate));
    }

    return {
      id: property.id,
      type: property.type.toLowerCase(),
      status: property.status.toLowerCase(),
      isDraft: property.status === PropertyStatus.DRAFT,
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
      images: (property.images || []).map((img: any) => ({
        url: img.url,
        sortOrder: img.sortOrder,
      })),
      amenities: (property.amenities || []).map((a: any) => ({
        name: a.name,
        icon: a.icon,
      })),
      rules: (property.rules || []).map((r: any) => r.rule),
      tags: (property.tags || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        category: t.category,
        icon: t.icon,
      })),
      recommendations: (property.recommendations || []).map((r: any) => ({
        id: r.id,
        audience: r.audience,
        title: r.title,
        reason: r.reason,
        badge: r.badge,
        sortOrder: r.sortOrder,
      })),
      hostId: property.hostId,
      hostName:
        property.host?.hostProfile?.businessName || property.host?.name || null,
      hostAvatar: property.host?.avatar || null,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,

      // Units
      stays: (property.stays || []).map((s: any) => ({
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
        tags: (s.tags || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          category: t.category,
          icon: t.icon,
        })),
        recommendations: (s.recommendations || []).map((r: any) => ({
          id: r.id,
          audience: r.audience,
          title: r.title,
          reason: r.reason,
          badge: r.badge,
          sortOrder: r.sortOrder,
        })),
      })),

      experiences: (property.experiences || []).map((e: any) => ({
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
        timeSlots: (e.timeSlots || []).map((ts: any) => ts.slot),
        inclusions: (e.inclusions || []).map((i: any) => i.item),
        policies: e.policies || [],
        tags: (e.tags || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          category: t.category,
          icon: t.icon,
        })),
        recommendations: (e.recommendations || []).map((r: any) => ({
          id: r.id,
          audience: r.audience,
          title: r.title,
          reason: r.reason,
          badge: r.badge,
          sortOrder: r.sortOrder,
        })),
      })),

      transports: (property.transports || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        from: t.from,
        to: t.to,
        vehicleType: t.vehicleType,
        capacity: t.capacity,
        pricePerSeat: t.pricePerSeat,
        priceFormatted:
          t.pricePerSeat != null
            ? `K${(t.pricePerSeat / 100).toFixed(2)}`
            : 'K0.00',
        schedule: t.schedule,
        isActive: t.isActive,
        policies: t.policies || [],
        tags: (t.tags || []).map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          category: tag.category,
          icon: tag.icon,
        })),
        recommendations: (t.recommendations || []).map((r: any) => ({
          id: r.id,
          audience: r.audience,
          title: r.title,
          reason: r.reason,
          badge: r.badge,
          sortOrder: r.sortOrder,
        })),
      })),
    };
  }

  private async assertOwnership(id: string, hostId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            hostProfile: {
              select: { defaultCheckInTime: true, defaultCheckOutTime: true },
            },
          },
        },
      },
    });
    if (!property || property.deletedAt)
      throw new NotFoundException('Property not found');
    if (property.hostId !== hostId)
      throw new NotFoundException('Property not found');
    return property;
  }

  /**
   * Syncs property status based on active inventory units.
   * - If no active units remain (targetCount === 0), sets status to BOOKED.
   * - If active units exist and property was BOOKED, sets status to ACTIVE.
   */
  private async syncPropertyStatus(id: string, activeUnitCount: number) {
    if (activeUnitCount === 0) {
      await this.prisma.property.update({
        where: { id },
        data: { status: PropertyStatus.BOOKED },
      });
    } else {
      await this.prisma.property.update({
        where: { id },
        data: { status: PropertyStatus.ACTIVE },
      });
    }
  }

  // ── Listing Policies ────────────────────────────────────────────────────────
  // Host-authored policies scoped to a specific Stay / Experience / Transport unit.

  /** Return all policies for a specific unit (public — visible on listing detail). */
  async getListingPolicies(
    unitType: 'stay' | 'experience' | 'transport',
    unitId: string,
  ) {
    return this.prisma.listingPolicy.findMany({
      where: {
        ...(unitType === 'stay' ? { stayId: unitId } : {}),
        ...(unitType === 'experience' ? { experienceId: unitId } : {}),
        ...(unitType === 'transport' ? { transportId: unitId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Add a single policy to a unit. */
  async addListingPolicy(
    unitType: 'stay' | 'experience' | 'transport',
    unitId: string,
    hostId: string,
    dto: CreateListingPolicyDto,
  ) {
    await this._assertUnitOwnership(unitType, unitId, hostId);
    return this.prisma.listingPolicy.create({
      data: {
        ...(unitType === 'stay' ? { stayId: unitId } : {}),
        ...(unitType === 'experience' ? { experienceId: unitId } : {}),
        ...(unitType === 'transport' ? { transportId: unitId } : {}),
        category: dto.category as unknown as ListingPolicyCategory,
        title: dto.title,
        body: dto.body,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * Bulk-replace all policies for a unit.
   * Deletes existing and inserts new set atomically.
   */
  async setListingPolicies(
    unitType: 'stay' | 'experience' | 'transport',
    unitId: string,
    hostId: string,
    dto: SetListingPoliciesDto,
  ) {
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
            category: p.category as unknown as ListingPolicyCategory,
            title: p.title,
            body: p.body,
            sortOrder: p.sortOrder ?? i,
          })),
        });
      }
    });

    return this.getListingPolicies(unitType, unitId);
  }

  /** Update a single listing policy. */
  async updateListingPolicy(
    policyId: string,
    hostId: string,
    dto: UpdateListingPolicyDto,
  ) {
    const policy = await this.prisma.listingPolicy.findUnique({
      where: { id: policyId },
    });
    if (!policy) throw new NotFoundException('Listing policy not found');

    // Verify ownership through the linked unit
    if (policy.stayId)
      await this._assertUnitOwnership('stay', policy.stayId, hostId);
    if (policy.experienceId)
      await this._assertUnitOwnership(
        'experience',
        policy.experienceId,
        hostId,
      );
    if (policy.transportId)
      await this._assertUnitOwnership('transport', policy.transportId, hostId);

    return this.prisma.listingPolicy.update({
      where: { id: policyId },
      data: {
        ...(dto.category !== undefined
          ? { category: dto.category as unknown as ListingPolicyCategory }
          : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  /** Remove a single listing policy. */
  async removeListingPolicy(policyId: string, hostId: string) {
    const policy = await this.prisma.listingPolicy.findUnique({
      where: { id: policyId },
    });
    if (!policy) throw new NotFoundException('Listing policy not found');

    if (policy.stayId)
      await this._assertUnitOwnership('stay', policy.stayId, hostId);
    if (policy.experienceId)
      await this._assertUnitOwnership(
        'experience',
        policy.experienceId,
        hostId,
      );
    if (policy.transportId)
      await this._assertUnitOwnership('transport', policy.transportId, hostId);

    await this.prisma.listingPolicy.delete({ where: { id: policyId } });
    return { id: policyId, deleted: true };
  }

  /**
   * Verifies the given host owns the unit (Stay/Experience/Transport).
   * Throws NotFoundException if not found or doesn't belong to this host.
   */
  private async _assertUnitOwnership(
    unitType: 'stay' | 'experience' | 'transport',
    unitId: string,
    hostId: string,
  ) {
    if (unitType === 'stay') {
      const stay = await this.prisma.stay.findUnique({
        where: { id: unitId },
        include: { property: { select: { hostId: true } } },
      });
      if (!stay || stay.property.hostId !== hostId) {
        throw new NotFoundException('Stay unit not found or access denied');
      }
    } else if (unitType === 'experience') {
      const exp = await this.prisma.experience.findUnique({
        where: { id: unitId },
        include: { property: { select: { hostId: true } } },
      });
      if (!exp || exp.property.hostId !== hostId) {
        throw new NotFoundException(
          'Experience unit not found or access denied',
        );
      }
    } else {
      const trans = await this.prisma.transport.findUnique({
        where: { id: unitId },
        include: { property: { select: { hostId: true } } },
      });
      if (!trans || trans.property.hostId !== hostId) {
        throw new NotFoundException(
          'Transport unit not found or access denied',
        );
      }
    }
  }

  // ── Listing Tags Management ──────────────────────────────────────────────────

  private _getTagTargetClause(
    targetType: 'property' | 'stay' | 'experience' | 'transport',
    targetId: string,
  ) {
    switch (targetType) {
      case 'property':
        return { propertyId: targetId };
      case 'stay':
        return { stayId: targetId };
      case 'experience':
        return { experienceId: targetId };
      case 'transport':
        return { transportId: targetId };
    }
  }

  async getTags(
    targetType: 'property' | 'stay' | 'experience' | 'transport',
    targetId: string,
  ) {
    const where = this._getTagTargetClause(targetType, targetId);
    return this.prisma.listingTag.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async setTags(
    targetType: 'property' | 'stay' | 'experience' | 'transport',
    targetId: string,
    hostId: string,
    tags: (string | CreateListingTagDto)[],
  ) {
    if (targetType === 'property') {
      await this.assertOwnership(targetId, hostId);
    } else {
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

  async addTag(
    targetType: 'property' | 'stay' | 'experience' | 'transport',
    targetId: string,
    hostId: string,
    dto: CreateListingTagDto,
  ) {
    if (targetType === 'property') {
      await this.assertOwnership(targetId, hostId);
    } else {
      await this._assertUnitOwnership(targetType, targetId, hostId);
    }

    const foreignKey = this._getTagTargetClause(targetType, targetId);
    const slug = toTagSlug(dto.name);

    return this.prisma.listingTag.create({
      data: {
        ...foreignKey,
        name: dto.name.trim(),
        slug,
        category: (dto.category || TagCategory.CATEGORY) as TagCategory,
        icon: dto.icon || null,
      },
    });
  }

  async removeTag(tagId: string, hostId: string) {
    const tag = await this.prisma.listingTag.findUnique({
      where: { id: tagId },
      include: {
        property: { select: { hostId: true } },
        stay: { include: { property: { select: { hostId: true } } } },
        experience: { include: { property: { select: { hostId: true } } } },
        transport: { include: { property: { select: { hostId: true } } } },
      },
    });

    if (!tag) throw new NotFoundException('Tag not found');

    const ownerHostId =
      tag.property?.hostId ||
      tag.stay?.property?.hostId ||
      tag.experience?.property?.hostId ||
      tag.transport?.property?.hostId;

    if (ownerHostId !== hostId) {
      throw new ForbiddenException(
        'Access denied: You do not own this listing',
      );
    }

    await this.prisma.listingTag.delete({ where: { id: tagId } });
    return { id: tagId, deleted: true };
  }

  // ── Listing Recommendations Management ──────────────────────────────────────

  async getRecommendations(
    targetType: 'property' | 'stay' | 'experience' | 'transport',
    targetId: string,
  ) {
    const where = this._getTagTargetClause(targetType, targetId);
    return this.prisma.listingRecommendation.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async setRecommendations(
    targetType: 'property' | 'stay' | 'experience' | 'transport',
    targetId: string,
    hostId: string,
    dtos: CreateListingRecommendationDto[],
  ) {
    if (targetType === 'property') {
      await this.assertOwnership(targetId, hostId);
    } else {
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

  async addRecommendation(
    targetType: 'property' | 'stay' | 'experience' | 'transport',
    targetId: string,
    hostId: string,
    dto: CreateListingRecommendationDto,
  ) {
    if (targetType === 'property') {
      await this.assertOwnership(targetId, hostId);
    } else {
      await this._assertUnitOwnership(targetType, targetId, hostId);
    }

    const foreignKey = this._getTagTargetClause(targetType, targetId);

    return this.prisma.listingRecommendation.create({
      data: {
        ...foreignKey,
        audience: (dto.audience ||
          RecommendationAudience.GENERAL) as RecommendationAudience,
        title: dto.title.trim(),
        reason: dto.reason || null,
        badge: dto.badge || null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async removeRecommendation(recId: string, hostId: string) {
    const rec = await this.prisma.listingRecommendation.findUnique({
      where: { id: recId },
      include: {
        property: { select: { hostId: true } },
        stay: { include: { property: { select: { hostId: true } } } },
        experience: { include: { property: { select: { hostId: true } } } },
        transport: { include: { property: { select: { hostId: true } } } },
      },
    });

    if (!rec) throw new NotFoundException('Recommendation not found');

    const ownerHostId =
      rec.property?.hostId ||
      rec.stay?.property?.hostId ||
      rec.experience?.property?.hostId ||
      rec.transport?.property?.hostId;

    if (ownerHostId !== hostId) {
      throw new ForbiddenException(
        'Access denied: You do not own this listing',
      );
    }

    await this.prisma.listingRecommendation.delete({ where: { id: recId } });
    return { id: recId, deleted: true };
  }

  // ── Discovery: Grouped Available Tags for Search & Filter Chips ──────────────

  async getAllAvailableTags() {
    const tags = await this.prisma.listingTag.findMany({
      where: {
        OR: [
          { property: { status: PropertyStatus.ACTIVE, deletedAt: null } },
          {
            stay: {
              property: { status: PropertyStatus.ACTIVE, deletedAt: null },
            },
          },
          {
            experience: {
              property: { status: PropertyStatus.ACTIVE, deletedAt: null },
            },
          },
          {
            transport: {
              property: { status: PropertyStatus.ACTIVE, deletedAt: null },
            },
          },
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

    const grouped: Record<
      string,
      { name: string; slug: string; icon?: string | null }[]
    > = {
      CATEGORY: [],
      AMENITY: [],
      ACTIVITY: [],
      LOCATION: [],
      TRIP_TYPE: [],
      VEHICLE_TYPE: [],
      OTHER: [],
    };

    for (const t of tags) {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push({ name: t.name, slug: t.slug, icon: t.icon });
    }

    return grouped;
  }

  // ── Search & Filter using Tags and Recommendations ──────────────────────────

  async filterByTags(query: ListingFilterQueryDto) {
    const tagConditions: any[] = [];

    if (query.category) {
      const slug = toTagSlug(query.category);
      tagConditions.push({
        OR: [
          { tags: { some: { category: TagCategory.CATEGORY, slug } } },
          {
            stays: {
              some: {
                tags: { some: { category: TagCategory.CATEGORY, slug } },
              },
            },
          },
          {
            experiences: {
              some: {
                tags: { some: { category: TagCategory.CATEGORY, slug } },
              },
            },
          },
          {
            transports: {
              some: {
                tags: { some: { category: TagCategory.CATEGORY, slug } },
              },
            },
          },
        ],
      });
    }

    if (query.activity) {
      const slug = toTagSlug(query.activity);
      tagConditions.push({
        OR: [
          { tags: { some: { category: TagCategory.ACTIVITY, slug } } },
          {
            experiences: {
              some: {
                tags: { some: { category: TagCategory.ACTIVITY, slug } },
              },
            },
          },
        ],
      });
    }

    if (query.amenity) {
      const slug = toTagSlug(query.amenity);
      tagConditions.push({
        OR: [
          { tags: { some: { category: TagCategory.AMENITY, slug } } },
          {
            amenities: {
              some: { name: { contains: query.amenity, mode: 'insensitive' } },
            },
          },
          {
            stays: {
              some: { tags: { some: { category: TagCategory.AMENITY, slug } } },
            },
          },
          {
            transports: {
              some: { tags: { some: { category: TagCategory.AMENITY, slug } } },
            },
          },
        ],
      });
    }

    if (query.location) {
      const slug = toTagSlug(query.location);
      tagConditions.push({
        OR: [
          { location: { contains: query.location, mode: 'insensitive' } },
          { tags: { some: { category: TagCategory.LOCATION, slug } } },
        ],
      });
    }

    if (query.tripType) {
      const slug = toTagSlug(query.tripType);
      tagConditions.push({
        OR: [
          { tags: { some: { category: TagCategory.TRIP_TYPE, slug } } },
          {
            transports: {
              some: {
                tags: { some: { category: TagCategory.TRIP_TYPE, slug } },
              },
            },
          },
        ],
      });
    }

    if (query.vehicleType) {
      const slug = toTagSlug(query.vehicleType);
      tagConditions.push({
        OR: [
          { tags: { some: { category: TagCategory.VEHICLE_TYPE, slug } } },
          {
            transports: {
              some: {
                vehicleType: {
                  contains: query.vehicleType,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            transports: {
              some: {
                tags: { some: { category: TagCategory.VEHICLE_TYPE, slug } },
              },
            },
          },
        ],
      });
    }

    if (query.recommendation) {
      const audience =
        query.recommendation.toUpperCase() as RecommendationAudience;
      tagConditions.push({
        OR: [
          { recommendations: { some: { audience } } },
          { stays: { some: { recommendations: { some: { audience } } } } },
          {
            experiences: { some: { recommendations: { some: { audience } } } },
          },
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

  /**
   * Fetch sample/test image assets stored in DB for testing APIs,
   * mock listings, and frontend demos.
   */
  async getSampleImages(category?: string, limit?: number) {
    const where: any = {};
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

  /**
   * 3.1 Create Listing (Unified Gateway)
   * Creates the property master entity, vertical units, images, amenities, rules, and policies in a single atomic transaction.
   */
  async createUnifiedListing(
    hostId: string,
    dto: CreateUnifiedListingDto,
  ): Promise<CreateUnifiedListingResponseDto> {
    const propertyType = dto.vertical.toUpperCase() as PropertyType;
    const fullLocation = [dto.address, dto.city, dto.province]
      .filter(Boolean)
      .join(', ');

    const policyMap: Record<string, CancellationPolicy> = {
      flexible: CancellationPolicy.FLEXIBLE,
      moderate: CancellationPolicy.MODERATE,
      strict: CancellationPolicy.STRICT,
    };
    const cancellationPolicy =
      policyMap[dto.cancellationPolicy.toLowerCase()] ||
      CancellationPolicy.MODERATE;

    const property = await this.prisma.$transaction(async (tx) => {
      const prop = await tx.property.create({
        data: {
          hostId,
          type: propertyType,
          status: PropertyStatus.ACTIVE,
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
            inventoryCount:
              dto.inventoryCount || dto.stayDetails?.inventoryCount || 1,
          },
        },
      });

      // Images
      if (dto.images && dto.images.length > 0) {
        await tx.propertyImage.createMany({
          data: dto.images.map((url, idx) => ({
            propertyId: prop.id,
            url,
            sortOrder: idx,
          })),
        });
      }

      // Amenities (standard + guestFavourites + standoutAmenities + safetyAmenities)
      const allAmenities = new Set<string>();
      (dto.amenities || []).forEach((a) => allAmenities.add(a));
      (dto.stayDetails?.guestFavourites || []).forEach((a) =>
        allAmenities.add(a),
      );
      (dto.stayDetails?.standoutAmenities || []).forEach((a) =>
        allAmenities.add(a),
      );
      (dto.stayDetails?.safetyAmenities || []).forEach((a) =>
        allAmenities.add(a),
      );

      if (allAmenities.size > 0) {
        await tx.propertyAmenity.createMany({
          data: Array.from(allAmenities).map((name) => ({
            propertyId: prop.id,
            name,
          })),
          skipDuplicates: true,
        });
      }

      // House rules
      if (dto.houseRules && dto.houseRules.length > 0) {
        await tx.propertyRule.createMany({
          data: dto.houseRules.map((rule) => ({
            propertyId: prop.id,
            rule,
          })),
        });
      }

      // Vertical inventory units
      if (propertyType === 'STAY') {
        const stayDetails = dto.stayDetails;
        const totalCount =
          dto.inventoryCount ||
          stayDetails?.inventoryCount ||
          stayDetails?.units?.length ||
          1;

        const units: Array<{ name: string; type: string; maxGuests: number }> =
          [];

        if (stayDetails?.units && stayDetails.units.length > 0) {
          stayDetails.units.forEach((u) => {
            units.push({
              name: u.name,
              type: u.type || stayDetails?.propertyType || 'Standard Room',
              maxGuests: u.maxGuests || stayDetails?.maxGuests || 2,
            });
          });
          // If totalCount is greater than units provided, pad up to totalCount
          for (let i = units.length; i < totalCount; i++) {
            units.push({
              name: `${dto.title} ${i + 1}`,
              type: stayDetails?.propertyType || 'Standard Room',
              maxGuests: stayDetails?.maxGuests || 2,
            });
          }
        } else if (totalCount > 1) {
          // Auto-generate totalCount chalets / units (e.g. Mukuni Chalet 1 .. 15)
          for (let i = 0; i < totalCount; i++) {
            units.push({
              name: `${dto.title} ${i + 1}`,
              type: stayDetails?.propertyType || 'Standard Room',
              maxGuests: stayDetails?.maxGuests || 2,
            });
          }
        } else {
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
              unitType: (u.type || stayDetails?.propertyType || 'STANDARD_ROOM')
                .toUpperCase()
                .replace(/\s+/g, '_') as any,
              rate: dto.pricePerUnitNgwee,
              isActive: true,
            },
          });

          await tx.stayInventory.create({
            data: {
              stayId: stay.id,
              total: 1,
              available: 1,
              booked: 0,
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
      } else if (propertyType === 'EXPERIENCE') {
        const expDetails = dto.experienceDetails;
        const meetingPoint =
          expDetails?.meetingPoint || dto.meetingPoint || fullLocation;
        const meetingPointAddress =
          expDetails?.meetingPointAddress ||
          dto.meetingPointAddress ||
          meetingPoint;
        const whatsIncluded =
          expDetails?.whatsIncluded ||
          expDetails?.inclusions ||
          dto.whatsIncluded ||
          dto.inclusions ||
          [];
        const whatsNotIncluded =
          expDetails?.whatsNotIncluded ||
          expDetails?.exclusions ||
          dto.whatsNotIncluded ||
          dto.exclusions ||
          [];
        const whatToBring =
          expDetails?.whatToBring ||
          expDetails?.whatToCarry ||
          dto.whatToBring ||
          dto.whatToCarry ||
          [];
        const whatNotToBring =
          expDetails?.whatNotToBring || dto.whatNotToBring || [];
        const importantInformation =
          expDetails?.importantInformation ||
          expDetails?.guidelines ||
          dto.importantInformation ||
          dto.guidelines ||
          [];
        const notSuitableFor =
          expDetails?.notSuitableFor ||
          expDetails?.suitability ||
          dto.notSuitableFor ||
          dto.suitability ||
          [];
        const itinerary = expDetails?.itinerary || dto.itinerary || null;
        const rawSlots =
          expDetails?.slots ||
          expDetails?.timeSlots ||
          dto.slots ||
          dto.timeSlots ||
          [];

        const exp = await tx.experience.create({
          data: {
            propertyId: prop.id,
            name: dto.title,
            description: dto.description,
            rate: dto.pricePerUnitNgwee,
            experienceType: (
              expDetails?.activityType ||
              expDetails?.subtype ||
              dto.subtype ||
              'OTHER'
            )
              .toUpperCase()
              .replace(/\s+/g, '_') as any,
            meetingPoint,
            meetingPointAddress,
            whatsNotIncluded,
            whatToBring,
            whatNotToBring,
            importantInformation,
            notSuitableFor,
            isActive: true,
          },
        });

        await tx.experienceSlot.create({
          data: {
            experienceId: exp.id,
            startTime: '10:00',
            endTime: '13:00',
            label: 'Morning Slot (10-13hrs)',
            maxCapacity: expDetails?.maxParticipants || 10,
            available: expDetails?.maxParticipants || 10,
            booked: 0,
          },
        });

        if (whatsIncluded && whatsIncluded.length > 0) {
          await tx.experienceInclusion.createMany({
            data: whatsIncluded.map((item) => ({
              experienceId: exp.id,
              item,
            })),
          });
        }

        if (rawSlots && rawSlots.length > 0) {
          await tx.experienceSlot.createMany({
            data: rawSlots.map((ts: any) => {
              const slotStr =
                typeof ts === 'string'
                  ? ts
                  : ts.timeSlot || ts.label || '10:00 - 13:00';
              const parts =
                typeof slotStr === 'string' && slotStr.includes('-')
                  ? slotStr.split('-').map((s: string) => s.trim())
                  : [slotStr, '13:00'];
              return {
                experienceId: exp.id,
                startTime: parts[0] || '10:00',
                endTime: parts[1] || '13:00',
                label: typeof ts === 'string' ? ts : ts.label || slotStr,
                maxCapacity:
                  ts.maxParticipants || expDetails?.maxParticipants || 10,
                available:
                  ts.maxParticipants || expDetails?.maxParticipants || 10,
                booked: 0,
              };
            }),
          });
        }

        if (whatToBring && whatToBring.length > 0) {
          await tx.listingPolicy.create({
            data: {
              experienceId: exp.id,
              category: 'SAFETY',
              title: 'What to Bring',
              body: whatToBring.join(', '),
            },
          });
        }
      } else if (propertyType === 'TRANSPORT') {
        const transDetails = dto.transportDetails;
        const trans = await tx.transport.create({
          data: {
            propertyId: prop.id,
            name: dto.title,
            description: dto.description,
            from: transDetails?.pickupLocation || dto.city,
            to: transDetails?.dropoffLocation || dto.city,
            vehicleType: transDetails?.vehicleType || 'Vehicle',
            rate: dto.pricePerUnitNgwee,
            rentalType: 'seat_based',
            routeType: 'local',
            tripType: 'ONE_WAY',
            isActive: true,
          },
        });

        await tx.transportInventory.create({
          data: {
            transportId: trans.id,
            totalSeats: transDetails?.seatingCapacity || 14,
            available: transDetails?.seatingCapacity || 14,
            booked: 0,
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

  /**
   * 3.2 Update Listing Status (Publish / Pause / Archive / Inactive)
   * Updates master property status and cascades activation/deactivation across all child inventory units.
   */
  async updateListingStatus(
    id: string,
    hostId: string,
    statusStr: string,
  ): Promise<UpdateListingStatusResponseDto> {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });
    if (!property) throw new NotFoundException('Listing not found');
    if (property.hostId !== hostId) {
      const user = await this.prisma.user.findUnique({ where: { id: hostId } });
      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only the host can update this listing status',
        );
      }
    }

    let prismaStatus: PropertyStatus = PropertyStatus.ACTIVE;
    let deletedAt: Date | null = null;
    let returnStatus: 'active' | 'draft' | 'paused' | 'archived' | 'inactive' =
      'active';
    let childActive = true;

    const s = statusStr.toLowerCase();
    if (s === 'active') {
      prismaStatus = PropertyStatus.ACTIVE;
      deletedAt = null;
      returnStatus = 'active';
      childActive = true;
    } else if (s === 'draft') {
      prismaStatus = PropertyStatus.DRAFT;
      deletedAt = null;
      returnStatus = 'draft';
      childActive = false;
    } else if (s === 'paused' || s === 'inactive') {
      prismaStatus = PropertyStatus.INACTIVE;
      deletedAt = null;
      returnStatus = s === 'inactive' ? 'inactive' : 'paused';
      childActive = false;
    } else if (s === 'archived') {
      prismaStatus = PropertyStatus.INACTIVE;
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

      // Cascade to all child inventory units under this master property
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

  /**
   * 3.3 Delete / Deactivate Listing
   * Soft-deletes the master property and cascades deactivation & deletion to all child inventory units.
   */
  async deleteListing(
    id: string,
    hostId: string,
  ): Promise<DeleteListingResponseDto> {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });
    if (!property) throw new NotFoundException('Listing not found');
    if (property.hostId !== hostId) {
      const user = await this.prisma.user.findUnique({ where: { id: hostId } });
      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException('Only the host can delete this listing');
      }
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id },
        data: {
          deletedAt: now,
          status: PropertyStatus.INACTIVE,
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

  /**
   * Adjust Inventory Count
   * Modifies active inventory count for a property without deleting child units directly.
   * Decreasing count deactivates the excess units; increasing count reactivates or creates units.
   */
  async adjustInventoryCount(
    id: string,
    hostId: string,
    dto: AdjustInventoryDto,
  ): Promise<AdjustInventoryResponseDto> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        stays: { where: { deletedAt: null }, orderBy: { rate: 'asc' } },
        transports: { where: { deletedAt: null }, orderBy: { rate: 'asc' } },
        experiences: { where: { deletedAt: null }, orderBy: { rate: 'asc' } },
      },
    });

    if (!property) throw new NotFoundException('Listing not found');
    if (property.hostId !== hostId) {
      const user = await this.prisma.user.findUnique({ where: { id: hostId } });
      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only the host can adjust inventory for this listing',
        );
      }
    }

    if (property.type === 'STAY') {
      const stays = property.stays;
      const activeStays = stays.filter((s) => s.isActive);
      const currentActive = activeStays.length;

      let targetCount = currentActive;
      if (dto.operation === 'decrease') {
        targetCount = Math.max(0, currentActive - (dto.amount || 1));
      } else if (dto.operation === 'increase') {
        targetCount = currentActive + (dto.amount || 1);
      } else if (dto.inventoryCount !== undefined) {
        targetCount = Math.max(0, dto.inventoryCount);
      } else if (dto.operation === 'set' && dto.amount !== undefined) {
        targetCount = Math.max(0, dto.amount);
      }

      await this.prisma.$transaction(async (tx) => {
        if (targetCount < currentActive) {
          // Deactivate excess units (from the tail of active list)
          const toDeactivateCount = currentActive - targetCount;
          const toDeactivate = activeStays.slice(-toDeactivateCount);
          for (const s of toDeactivate) {
            await tx.stay.update({
              where: { id: s.id },
              data: { isActive: false },
            });
          }
        } else if (targetCount > currentActive) {
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
                  unitType: template?.unitType || ('STANDARD_ROOM' as any),
                  rate: template?.rate || 100000,
                  isActive: true,
                },
              });
            }
          }
        }

        const draftData = (property.draftData as Record<string, any>) || {};
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

      await this.syncPropertyStatus(property.id, targetCount);

      return {
        id: property.id,
        propertyName: property.name,
        inventoryCount: targetCount,
        activeUnitsCount: targetCount,
        updatedAt: new Date().toISOString(),
      };
    }

    // TRANSPORT or EXPERIENCE
    const units =
      property.type === 'TRANSPORT'
        ? property.transports
        : property.experiences;
    const activeUnits = units.filter((u) => u.isActive);
    const currentActive = activeUnits.length;

    let targetCount = currentActive;
    if (dto.operation === 'decrease') {
      targetCount = Math.max(0, currentActive - (dto.amount || 1));
    } else if (dto.operation === 'increase') {
      targetCount = currentActive + (dto.amount || 1);
    } else if (dto.inventoryCount !== undefined) {
      targetCount = Math.max(0, dto.inventoryCount);
    } else if (dto.operation === 'set' && dto.amount !== undefined) {
      targetCount = Math.max(0, dto.amount);
    }

    await this.prisma.$transaction(async (tx) => {
      if (property.type === 'TRANSPORT') {
        if (targetCount < currentActive) {
          const toDeactivate = activeUnits.slice(
            -(currentActive - targetCount),
          );
          for (const u of toDeactivate) {
            await tx.transport.update({
              where: { id: u.id },
              data: { isActive: false },
            });
          }
        } else if (targetCount > currentActive) {
          const inactive = units.filter((u) => !u.isActive);
          const reactivateCount = Math.min(
            targetCount - currentActive,
            inactive.length,
          );
          for (const u of inactive.slice(0, reactivateCount)) {
            await tx.transport.update({
              where: { id: u.id },
              data: { isActive: true },
            });
          }
        }
      } else {
        if (targetCount < currentActive) {
          const toDeactivate = activeUnits.slice(
            -(currentActive - targetCount),
          );
          for (const u of toDeactivate) {
            await tx.experience.update({
              where: { id: u.id },
              data: { isActive: false },
            });
          }
        } else if (targetCount > currentActive) {
          const inactive = units.filter((u) => !u.isActive);
          const reactivateCount = Math.min(
            targetCount - currentActive,
            inactive.length,
          );
          for (const u of inactive.slice(0, reactivateCount)) {
            await tx.experience.update({
              where: { id: u.id },
              data: { isActive: true },
            });
          }
        }
      }

      const draftData = (property.draftData as Record<string, any>) || {};
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

    await this.syncPropertyStatus(property.id, targetCount);

    return {
      id: property.id,
      propertyName: property.name,
      inventoryCount: targetCount,
      activeUnitsCount: targetCount,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update Property Pricing (Active future pricing only)
   * Updates property pricing table / future units without altering any historical booking records.
   */
  async updatePropertyPricing(
    id: string,
    hostId: string,
    dto: UpdatePropertyPricingDto,
  ): Promise<UpdatePropertyPricingResponseDto> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        stays: { where: { deletedAt: null } },
        experiences: { where: { deletedAt: null } },
        transports: { where: { deletedAt: null } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.hostId !== hostId) {
      const user = await this.prisma.user.findUnique({ where: { id: hostId } });
      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only the host can update pricing for this listing',
        );
      }
    }

    const newPriceNgwee = dto.pricePerUnitNgwee;
    const currency = dto.currency || property.currency || 'ZMW';

    await this.prisma.$transaction(async (tx) => {
      // 1. Update Property-level draftData and currency
      const draftData = (property.draftData as Record<string, any>) || {};
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

      // 2. Update future pricing on active units (Stay, Experience, or Transport)
      if (property.type === 'STAY') {
        await tx.stay.updateMany({
          where: { propertyId: id, deletedAt: null },
          data: { rate: newPriceNgwee },
        });
      } else if (property.type === 'EXPERIENCE') {
        await tx.experience.updateMany({
          where: { propertyId: id, deletedAt: null },
          data: { rate: newPriceNgwee },
        });
      } else if (property.type === 'TRANSPORT') {
        await tx.transport.updateMany({
          where: { propertyId: id, deletedAt: null },
          data: { rate: newPriceNgwee },
        });
      }

      // CRITICAL: We NEVER touch the Booking table. Historical booked amounts remain exactly as booked!
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

  // ── Host & Property Policies ───────────────────────────────────────────────

  async updatePropertyPolicies(
    propertyId: string,
    hostId: string,
    dto: UpdatePropertyPoliciesDto,
  ) {
    const property = await this.assertOwnership(propertyId, hostId);

    const existingDraft =
      property.draftData && typeof property.draftData === 'object'
        ? (property.draftData as Record<string, any>)
        : {};

    const updatedDraft = {
      ...existingDraft,
      policies: JSON.parse(JSON.stringify(dto)),
    };

    // Update Property record
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

    // Cascade to Stay records if applicable
    let cancellationEnum: CancellationPolicy | null = null;
    if (dto.cancellation?.tier) {
      const tierUpper = dto.cancellation.tier.toUpperCase();
      if (['FLEXIBLE', 'MODERATE', 'STRICT'].includes(tierUpper)) {
        cancellationEnum = tierUpper as CancellationPolicy;
      } else {
        cancellationEnum = CancellationPolicy.MODERATE;
      }
    }

    if (dto.schedule || cancellationEnum) {
      await this.prisma.stay.updateMany({
        where: { propertyId },
        data: {
          ...(cancellationEnum ? { cancellationPolicy: cancellationEnum } : {}),
          ...(dto.schedule?.checkInFrom
            ? { checkInFrom: dto.schedule.checkInFrom }
            : {}),
          ...(dto.schedule?.checkInUntil
            ? { checkInUntil: dto.schedule.checkInUntil }
            : {}),
          ...(dto.schedule?.checkOutBefore
            ? { checkOutBefore: dto.schedule.checkOutBefore }
            : {}),
        },
      });
    }

    // Cascade rules to PropertyRule
    if (
      dto.houseRules?.customRules &&
      Array.isArray(dto.houseRules.customRules)
    ) {
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

    // Compute summary
    const tier = dto.cancellation?.tier || 'moderate';
    const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1);
    const refundPercent =
      dto.cancellation?.refundPercentagePriorToCutOff ?? 100;
    const cutOffDays = Math.round(
      (dto.cancellation?.freeCancellationCutOffHours || 120) / 24,
    );
    const cancellationSummary = `${tierCapitalized} (${refundPercent}% refund up to ${cutOffDays} days before check-in)`;

    let rulesCount = dto.houseRules?.customRules?.length || 0;
    if (dto.houseRules) {
      if (!dto.houseRules.smokingAllowed) rulesCount++;
      if (!dto.houseRules.petsAllowed) rulesCount++;
      if (!dto.houseRules.partiesOrEventsAllowed) rulesCount++;
      if (dto.houseRules.quietHours?.enabled) rulesCount++;
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

  async getPropertyPolicies(propertyOrListingId: string) {
    let property = await this.prisma.property.findUnique({
      where: { id: propertyOrListingId },
      include: {
        stays: { take: 1, orderBy: { rate: 'asc' } },
        rules: true,
      },
    });

    if (!property) {
      const stay = await this.prisma.stay.findUnique({
        where: { id: propertyOrListingId },
        include: {
          property: {
            include: {
              stays: { take: 1, orderBy: { rate: 'asc' } },
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
      throw new NotFoundException(
        `Property or listing "${propertyOrListingId}" not found`,
      );
    }

    const stored: any = (property.draftData as any)?.policies || {};
    const primaryStay = property.stays?.[0];

    const tier = (stored.cancellation?.tier || 'moderate') as CancellationTier;
    const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1);
    const deadlineHours =
      stored.cancellation?.freeCancellationCutOffHours || 120;
    const deadlineDate = new Date(
      Date.now() + deadlineHours * 3600 * 1000,
    ).toISOString();

    const cancellation = {
      tier,
      headline: `${tierCapitalized} cancellation policy`,
      description:
        stored.cancellation?.customText ||
        (tier === 'flexible'
          ? 'Full refund up to 24 hours before check-in.'
          : tier === 'strict'
            ? 'Full refund up to 7 days before check-in. No refund after cutoff.'
            : 'Full refund up to 5 days before check-in. Cancellations made within 5 days of arrival receive a 50% refund minus transaction fees.'),
      freeCancellationDeadline: deadlineDate,
    };

    const checkInFrom = stored.schedule?.checkInFrom || '14:00';
    const checkInUntil = stored.schedule?.checkInUntil || '21:00';
    const checkOutBefore = stored.schedule?.checkOutBefore || '10:30';

    const houseRulesSummary: string[] = [];
    if (stored.houseRules) {
      if (!stored.houseRules.smokingAllowed)
        houseRulesSummary.push('No smoking indoors');
      if (!stored.houseRules.petsAllowed)
        houseRulesSummary.push('No pets allowed');
      if (!stored.houseRules.partiesOrEventsAllowed)
        houseRulesSummary.push('No parties or events');
      if (stored.houseRules.quietHours?.enabled) {
        houseRulesSummary.push(
          `Quiet hours: ${stored.houseRules.quietHours.startTime} – ${stored.houseRules.quietHours.endTime}`,
        );
      }
      if (Array.isArray(stored.houseRules.customRules)) {
        houseRulesSummary.push(...stored.houseRules.customRules);
      }
    } else if (property.rules?.length) {
      houseRulesSummary.push(...property.rules.map((r) => r.rule));
    } else {
      houseRulesSummary.push(
        'No smoking indoors',
        'No pets allowed',
        'No parties or events',
        'Quiet hours: 22:00 – 06:30',
      );
    }

    const depositAmount = stored.securityDeposit?.amountNgwee ?? 75000;
    const depositTimeline = stored.securityDeposit?.refundTimelineHours ?? 48;
    const securityDepositNote =
      stored.securityDeposit?.required !== false
        ? `A refundable security deposit of K${(depositAmount / 100).toFixed(2)} will be held and released within ${depositTimeline} hours of checkout.`
        : 'No security deposit required.';

    const goodToKnow =
      stored.goodToKnow?.customPoliciesText ||
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
}
