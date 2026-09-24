import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateStayDto, UpdateStayDto } from './dto/create-stay.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/create-experience.dto';
import { CreateTransportDto, UpdateTransportDto } from './dto/create-transport.dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Full include helper ──────────────────────────────────────────────────────

  private readonly fullInclude = {
    host: { select: { id: true, name: true, avatar: true, businessName: true } },
    stays: {
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' as const },
    },
    experiences: {
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' as const },
      include: {
        timeSlots: { orderBy: { slot: 'asc' as const } },
        inclusions: true,
      },
    },
    transports: {
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' as const },
    },
    images: { orderBy: { sortOrder: 'asc' as const } },
    amenities: { orderBy: { name: 'asc' as const } },
    rules: true,
    reviews: { select: { rating: true } },
    _count: { select: { reviews: true, bookings: true } },
  } as const;

  // ── Property (Business level) CRUD ──────────────────────────────────────────

  async createProperty(hostId: string, dto: CreatePropertyDto) {
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

  async update(id: string, hostId: string, dto: UpdatePropertyDto) {
    await this.assertOwnership(id, hostId);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.currency !== undefined) data.currency = dto.currency;

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
      throw new BadRequestException('Cannot add a stay unit to a non-stay property');
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

  async listStays(propertyId: string) {
    return this.prisma.stay.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateStay(propertyId: string, stayId: string, hostId: string, dto: UpdateStayDto) {
    await this.assertOwnership(propertyId, hostId);
    const stay = await this.prisma.stay.findFirst({ where: { id: stayId, propertyId } });
    if (!stay) throw new NotFoundException('Stay unit not found');

    const updated = await this.prisma.stay.update({
      where: { id: stayId },
      data: dto,
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

  async addExperience(propertyId: string, hostId: string, dto: CreateExperienceDto) {
    const property = await this.assertOwnership(propertyId, hostId);
    if (property.type !== 'EXPERIENCE') {
      throw new BadRequestException('Cannot add an experience unit to a non-experience property');
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

  async listExperiences(propertyId: string) {
    return this.prisma.experience.findMany({
      where: { propertyId, deletedAt: null },
      include: {
        timeSlots: { orderBy: { slot: 'asc' } },
        inclusions: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateExperience(propertyId: string, experienceId: string, hostId: string, dto: UpdateExperienceDto) {
    await this.assertOwnership(propertyId, hostId);
    const exp = await this.prisma.experience.findFirst({ where: { id: experienceId, propertyId } });
    if (!exp) throw new NotFoundException('Experience unit not found');

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

  async removeExperience(propertyId: string, experienceId: string, hostId: string) {
    await this.assertOwnership(propertyId, hostId);
    await this.prisma.experience.update({
      where: { id: experienceId },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { propertyId, experienceId, deleted: true };
  }

  // ── Transport Unit CRUD ──────────────────────────────────────────────────────

  async addTransport(propertyId: string, hostId: string, dto: CreateTransportDto) {
    const property = await this.assertOwnership(propertyId, hostId);
    if (property.type !== 'TRANSPORT') {
      throw new BadRequestException('Cannot add a transport unit to a non-transport property');
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

  async listTransports(propertyId: string) {
    return this.prisma.transport.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateTransport(propertyId: string, transportId: string, hostId: string, dto: UpdateTransportDto) {
    await this.assertOwnership(propertyId, hostId);
    const transport = await this.prisma.transport.findFirst({ where: { id: transportId, propertyId } });
    if (!transport) throw new NotFoundException('Transport unit not found');

    const updated = await this.prisma.transport.update({
      where: { id: transportId },
      data: {
        ...dto,
        schedule: dto.schedule ? JSON.parse(JSON.stringify(dto.schedule)) : undefined,
      },
    });

    return { propertyId, transport: updated };
  }

  async removeTransport(propertyId: string, transportId: string, hostId: string) {
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
      data: imageUrls.map((url, i) => ({ propertyId: id, url, sortOrder: baseOrder + i })),
    });

    const images = await this.prisma.propertyImage.findMany({
      where: { propertyId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return { id, images: images.map((img) => ({ url: img.url, sortOrder: img.sortOrder })) };
  }

  async removeImage(id: string, hostId: string, imageUrl: string) {
    await this.assertOwnership(id, hostId);
    await this.prisma.propertyImage.deleteMany({ where: { propertyId: id, url: imageUrl } });
    const images = await this.prisma.propertyImage.findMany({
      where: { propertyId: id },
      orderBy: { sortOrder: 'asc' },
    });
    return { id, images: images.map((img) => ({ url: img.url, sortOrder: img.sortOrder })) };
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

  // ── Reads ────────────────────────────────────────────────────────────────────

  async findByHost(hostId: string) {
    const properties = await this.prisma.property.findMany({
      where: { hostId, deletedAt: null },
      include: this.fullInclude,
      orderBy: { createdAt: 'desc' },
    });
    return properties.map((p) => this.formatProperty(p));
  }

  async findOneFromDb(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: this.fullInclude,
    });
    if (!property || property.deletedAt) throw new NotFoundException('Property not found');
    return this.formatProperty(property);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  public formatProperty(property: any) {
    const ratings = property.reviews?.map((r: any) => r.rating) || [];
    const avgRating = ratings.length
      ? Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
      : 0;

    let startingPrice = 0;
    if (property.type === 'STAY' && property.stays?.length) {
      const active = property.stays.filter((s: any) => s.isActive);
      if (active.length) startingPrice = Math.min(...active.map((s: any) => s.price));
    } else if (property.type === 'EXPERIENCE' && property.experiences?.length) {
      const active = property.experiences.filter((e: any) => e.isActive);
      if (active.length) startingPrice = Math.min(...active.map((e: any) => e.price));
    } else if (property.type === 'TRANSPORT' && property.transports?.length) {
      const active = property.transports.filter((t: any) => t.isActive && t.pricePerSeat != null);
      if (active.length) startingPrice = Math.min(...active.map((t: any) => t.pricePerSeat));
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
      images: (property.images || []).map((img: any) => ({ url: img.url, sortOrder: img.sortOrder })),
      amenities: (property.amenities || []).map((a: any) => ({ name: a.name, icon: a.icon })),
      rules: (property.rules || []).map((r: any) => r.rule),
      hostId: property.hostId,
      hostName: property.host?.businessName || property.host?.name || null,
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
        priceFormatted: t.pricePerSeat != null ? `K${(t.pricePerSeat / 100).toFixed(2)}` : 'K0.00',
        schedule: t.schedule,
        isActive: t.isActive,
      })),
    };
  }

  private async assertOwnership(id: string, hostId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { host: { select: { defaultCheckInTime: true, defaultCheckOutTime: true } } },
    });
    if (!property || property.deletedAt) throw new NotFoundException('Property not found');
    if (property.hostId !== hostId) throw new NotFoundException('Property not found');
    return property;
  }
}

// Backwards compatibility alias
export const ListingsService = PropertiesService;
