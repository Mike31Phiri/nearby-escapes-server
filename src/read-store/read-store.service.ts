import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReadPropertyDocument } from './types/property-document.type';

@Injectable()
export class ReadStoreService {
  private readonly logger = new Logger(ReadStoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Sync helpers (kept for backwards compatibility; writes go direct to DB) ───

  async enqueueSync(propertyId: string, deleted = false): Promise<void> {
    // Writes are saved directly to PostgreSQL, so no background sync queue is needed
    return Promise.resolve();
  }

  async upsertProperty(doc: ReadPropertyDocument): Promise<void> {
    return Promise.resolve();
  }

  async upsertListing(doc: ReadPropertyDocument): Promise<void> {
    return Promise.resolve();
  }

  async deleteProperty(propertyId: string): Promise<void> {
    return Promise.resolve();
  }

  async deleteListing(listingId: string): Promise<void> {
    return Promise.resolve();
  }

  // ── Read side (direct PostgreSQL lookups) ───────────────────────────────────

  async getPropertyById(id: string): Promise<ReadPropertyDocument> {
    return this.getPropertyFromDb(id);
  }

  async getListingById(id: string): Promise<ReadPropertyDocument> {
    return this.getPropertyById(id);
  }

  async searchProperties(query: any): Promise<{ data: ReadPropertyDocument[]; meta: any }> {
    return this.searchPropertiesFromDb(query);
  }

  async searchListings(query: any) {
    return this.searchProperties(query);
  }

  // ── Database Queries (Prisma / PostgreSQL) ──────────────────────────────────

  private async getPropertyFromDb(id: string): Promise<ReadPropertyDocument> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, avatar: true, hostProfile: { select: { businessName: true, isApproved: true } } } },
        stays: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        experiences: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: { timeSlots: { orderBy: { slot: 'asc' } }, inclusions: true },
        },
        transports: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: { orderBy: { name: 'asc' } },
        rules: true,
        reviews: { select: { rating: true } },
      },
    });

    if (!property || property.deletedAt || property.status !== 'ACTIVE') {
      throw new NotFoundException('Property not found');
    }
    return this.mapToDoc(property);
  }

  private async searchPropertiesFromDb(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE', deletedAt: null };

    const typeFilter = query.vertical || query.type;
    if (typeFilter && typeFilter !== 'all') {
      where.type = typeFilter.toUpperCase();
    }

    const searchTerms: any[] = [];
    if (query.q) {
      searchTerms.push(
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { location: { contains: query.q, mode: 'insensitive' } },
      );
    }
    if (query.city) {
      searchTerms.push({ location: { contains: query.city, mode: 'insensitive' } });
    }
    if (query.province) {
      searchTerms.push({ location: { contains: query.province, mode: 'insensitive' } });
    }
    if (query.location && !query.q && !query.city && !query.province) {
      searchTerms.push({ location: { contains: query.location, mode: 'insensitive' } });
    }
    if (searchTerms.length > 0) {
      where.OR = searchTerms;
    }

    if (query.from || query.to) {
      where.transports = {
        some: {
          isActive: true,
          deletedAt: null,
          ...(query.from ? { from: { contains: query.from, mode: 'insensitive' } } : {}),
          ...(query.to ? { to: { contains: query.to, mode: 'insensitive' } } : {}),
        },
      };
    }

    if (query.amenities) {
      const amenityList = String(query.amenities)
        .split(',')
        .map((a: string) => a.trim())
        .filter(Boolean);
      if (amenityList.length > 0) {
        where.amenities = {
          some: {
            name: { in: amenityList, mode: 'insensitive' },
          },
        };
      }
    }

    if (query.guests || query.bedrooms) {
      where.stays = {
        some: {
          isActive: true,
          deletedAt: null,
          ...(query.guests ? { maxGuests: { gte: Number(query.guests) } } : {}),
          ...(query.bedrooms ? { bedrooms: { gte: Number(query.bedrooms) } } : {}),
        },
      };
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          host: { select: { id: true, name: true, avatar: true, hostProfile: { select: { businessName: true, isApproved: true } } } },
          stays: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
          experiences: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            include: { timeSlots: { orderBy: { slot: 'asc' } }, inclusions: true },
          },
          transports: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
          images: { orderBy: { sortOrder: 'asc' } },
          amenities: { orderBy: { name: 'asc' } },
          rules: true,
          reviews: { select: { rating: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    let docs = properties.map((p) => this.mapToDoc(p));

    const minP = query.minPriceNgwee !== undefined ? Number(query.minPriceNgwee) : query.minPrice !== undefined ? Number(query.minPrice) : undefined;
    const maxP = query.maxPriceNgwee !== undefined ? Number(query.maxPriceNgwee) : query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;
    if (minP !== undefined) docs = docs.filter((d) => d.price >= minP);
    if (maxP !== undefined) docs = docs.filter((d) => d.price <= maxP);

    if (query.sort === 'price_asc') {
      docs.sort((a, b) => a.price - b.price);
    } else if (query.sort === 'price_desc') {
      docs.sort((a, b) => b.price - a.price);
    } else if (query.sort === 'rating') {
      docs.sort((a, b) => b.rating - a.rating);
    } else if (query.sort === 'popular') {
      docs.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return {
      data: docs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapToDoc(property: any): ReadPropertyDocument {
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

    const locationParts = (property.location || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const city = locationParts[0] || null;
    const province = locationParts.length > 1 ? locationParts[locationParts.length - 1] : null;
    const slug = (property.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const featuredImage = property.images?.[0]?.url || null;

    return {
      id: property.id,
      type: property.type.toLowerCase(),
      status: property.status.toLowerCase(),
      name: property.name,
      description: property.description,
      location: property.location,
      currency: property.currency,
      price: Math.round(startingPrice / 100),
      priceFormatted: `K${(startingPrice / 100).toFixed(2)}`,
      rating: avgRating,
      reviewCount: ratings.length,
      thumbnailUrl: featuredImage,
      images: (property.images || []).map((img: any) => ({ url: img.url, sortOrder: img.sortOrder })),
      amenities: (property.amenities || []).map((a: any) => ({ name: a.name, icon: a.icon })),
      rules: (property.rules || []).map((r: any) => r.rule),
      hostId: property.hostId,
      hostName: (property.host as any)?.hostProfile?.businessName || property.host?.name || null,
      hostAvatar: property.host?.avatar || null,

      // Frontend contract aliases
      vertical: property.type.toLowerCase(),
      title: property.name,
      slug,
      city,
      province,
      featuredImage,
      image: featuredImage,
      pricePerUnitNgwee: startingPrice,
      reviews: ratings.length,
      host: {
        id: property.hostId,
        name: (property.host as any)?.hostProfile?.businessName || property.host?.name || null,
        avatarUrl: property.host?.avatar || null,
        superhost: Boolean((property.host as any)?.hostProfile?.isApproved),
      },
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
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    };
  }
}
