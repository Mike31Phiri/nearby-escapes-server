import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStayDto, CreateExperienceDto, CreateTransportDto, UpdateListingDto } from './dto/create-listing.dto';
import { ListingType, Prisma } from '@prisma/client';

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Search / Filter ───────────────────────────────────────────────────────

  async findAll(query: {
    type?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
    featured?: string;
    minDuration?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
    };

    // Filter by type
    if (query.type && query.type !== 'all') {
      where.type = query.type.toUpperCase() as ListingType;
    }

    // Location search
    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    // Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    // Featured (gems = high-rated listings)
    if (query.featured === 'gem') {
      where.reviews = {
        some: { rating: { gte: 4 } },
      };
    }

    // Sort
    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { price: 'asc' };
    else if (query.sort === 'price_desc') orderBy = { price: 'desc' };
    else if (query.sort === 'newest') orderBy = { createdAt: 'desc' };

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

  // ─── Single listing ────────────────────────────────────────────────────────

  async findStay(id: string) {
    return this.findOneByType(id, 'STAY');
  }

  async findExperience(id: string) {
    return this.findOneByType(id, 'EXPERIENCE');
  }

  async findTransport(id: string) {
    return this.findOneByType(id, 'TRANSPORT');
  }

  private async findOneByType(id: string, type: ListingType) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        host: { include: { user: { select: { name: true, avatar: true } } } },
        reviews: { include: { guest: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        _count: { select: { reviews: true, bookings: true } },
      },
    });
    if (!listing || listing.deletedAt) throw new NotFoundException('Listing not found');
    if (listing.type !== type) throw new NotFoundException(`Listing is not a ${type.toLowerCase()}`);
    return this.formatListing(listing);
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async createStay(hostId: string, dto: CreateStayDto) {
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

  async createExperience(hostId: string, dto: CreateExperienceDto) {
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

  async createTransport(hostId: string, dto: CreateTransportDto) {
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

  async update(id: string, hostId: string, dto: UpdateListingDto) {
    const listing = await this.assertOwnership(id, hostId);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.status !== undefined) data.status = dto.status.toUpperCase();

    const updated = await this.prisma.listing.update({
      where: { id },
      data,
      include: { host: { include: { user: { select: { name: true, avatar: true } } } } },
    });
    return this.formatListing(updated);
  }

  async remove(id: string, hostId: string) {
    await this.assertOwnership(id, hostId);
    return this.prisma.listing.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async findByHost(hostId: string) {
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

  async addImages(id: string, hostId: string, imageUrls: string[]) {
    await this.assertOwnership(id, hostId);
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    const updated = await this.prisma.listing.update({
      where: { id },
      data: { images: [...(listing?.images || []), ...imageUrls] },
    });
    return { images: updated.images };
  }

  async removeImage(id: string, hostId: string, imageUrl: string) {
    await this.assertOwnership(id, hostId);
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    const images = (listing?.images || []).filter((img) => img !== imageUrl);
    await this.prisma.listing.update({ where: { id }, data: { images } });
    return { images };
  }

  // ─── Curated collections ───────────────────────────────────────────────────

  async getCurated(type?: string) {
    const where: Prisma.ListingWhereInput = { deletedAt: null, status: 'ACTIVE' };

    if (type === 'packages') {
      // Packages = 3+ day experiences
      where.type = 'EXPERIENCE';
      // We'll use a reasonable proxy for "3+ day" — listings with longer descriptions
    } else if (type === 'gems') {
      // Gems = high-rated listings
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

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private formatListing(listing: any) {
    const host = listing.host;
    const ratings = listing.reviews?.map((r: any) => r.rating) || [];
    const avgRating = ratings.length
      ? Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
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

    // Add type-specific fields
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

  private async assertOwnership(id: string, hostId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.hostId !== hostId) throw new NotFoundException('Listing not found');
    return listing;
  }
}
