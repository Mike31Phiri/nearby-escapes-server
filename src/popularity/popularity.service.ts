import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';

export const POPULAR_STAYS_KEY = 'popular:stays';
export const POPULAR_EXPERIENCES_KEY = 'popular:experiences';
export const POPULAR_METADATA_KEY = 'popular:metadata';
const CACHE_TTL_SECONDS = 60 * 60 * 48; // 48 hours TTL buffer for midnight 24h cron

@Injectable()
export class PopularityService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PopularityService.name);
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.config.get<string>('REDIS_HOST') || 'localhost',
      port: this.config.get<number>('REDIS_PORT') || 6379,
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
      await this.redis.connect().catch(() => {});
      const hasStays = await this.redis.exists(POPULAR_STAYS_KEY);
      const hasExp = await this.redis.exists(POPULAR_EXPERIENCES_KEY);

      if (!hasStays || !hasExp) {
        this.logger.log('Initial popular listings cache missing or incomplete. Priming now...');
        await this.recalculateAll();
      } else {
        this.logger.log('Popular listings cache primed and ready in Redis.');
      }
    } catch (err: any) {
      this.logger.warn(`Could not verify or prime Redis popular listings on startup: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch {}
  }

  // ── Scheduled midnight cron (runs every 24 hours at 00:00:00) ──────────────

  @Cron('0 0 * * *', {
    name: 'calculate-popular-listings',
  })
  async handleMidnightRecalculation() {
    this.logger.log('⏰ Starting 24h midnight popularity calculator...');
    try {
      await this.recalculateAll();
      this.logger.log('✅ Midnight popularity recalculation finished successfully.');
    } catch (err: any) {
      this.logger.error(`❌ Midnight popularity recalculation failed: ${err.message}`, err.stack);
    }
  }

  // ── Manual or programmatic calculation ─────────────────────────────────────

  async recalculateAll(): Promise<{
    stays: number;
    experiences: number;
    timestamp: string;
  }> {
    const [stays, experiences] = await Promise.all([
      this.calculateAndStorePopular('STAY', 10),
      this.calculateAndStorePopular('EXPERIENCE', 10),
    ]);

    const timestamp = new Date().toISOString();
    try {
      await this.redis.set(
        POPULAR_METADATA_KEY,
        JSON.stringify({
          lastCalculated: timestamp,
          stayCount: stays.length,
          experienceCount: experiences.length,
        }),
        'EX',
        CACHE_TTL_SECONDS,
      );
    } catch (err: any) {
      this.logger.warn(`Failed to cache popularity metadata: ${err.message}`);
    }

    return {
      stays: stays.length,
      experiences: experiences.length,
      timestamp,
    };
  }

  /**
   * Calculates top N listings of a given type based on the bookings table.
   * Properties with the most bookings appear first.
   * If fewer than N properties have bookings, it backfills with other active listings.
   */
  async calculateAndStorePopular(type: 'STAY' | 'EXPERIENCE', limit = 10): Promise<any[]> {
    const key = type === 'STAY' ? POPULAR_STAYS_KEY : POPULAR_EXPERIENCES_KEY;

    // 1. Group bookings by propertyId where property matches the desired type and is active
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

    const bookingMap = new Map<string, number>();
    const orderedIds: string[] = [];

    for (const b of bookingCounts) {
      bookingMap.set(b.propertyId, b._count.id);
      orderedIds.push(b.propertyId);
    }

    // 2. If fewer than 10 properties have bookings, backfill with active properties
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
      } catch {}
      return [];
    }

    // 3. Fetch full property records for all ordered IDs
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

    const propertyMap = new Map<string, any>();
    for (const p of properties) {
      propertyMap.set(p.id, p);
    }

    // 4. Format them in the exact order determined by booking count
    const formatted: any[] = [];
    let rank = 1;

    for (const id of orderedIds) {
      const p = propertyMap.get(id);
      if (!p) continue;

      const doc = this.formatListingDoc(p);
      const bookingCount = bookingMap.get(id) ?? p._count?.bookings ?? 0;

      formatted.push({
        ...doc,
        popularRank: rank++,
        bookingCount,
      });
    }

    // 5. Store in Redis
    try {
      await this.redis.set(key, JSON.stringify(formatted), 'EX', CACHE_TTL_SECONDS);
      this.logger.log(`Stored ${formatted.length} popular ${type.toLowerCase()}s in Redis at key "${key}"`);
    } catch (err: any) {
      this.logger.warn(`Failed to store popular ${type.toLowerCase()}s in Redis: ${err.message}`);
    }

    return formatted;
  }

  // ── Public Getters (Redis-first with DB fallback) ──────────────────────────

  async getPopularStays(): Promise<any[]> {
    try {
      const cached = await this.redis.get(POPULAR_STAYS_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err: any) {
      this.logger.warn(`Redis get "${POPULAR_STAYS_KEY}" failed: ${err.message}`);
    }

    // Cache miss or Redis unavailable: calculate, cache and return
    return this.calculateAndStorePopular('STAY', 10);
  }

  async getPopularExperiences(): Promise<any[]> {
    try {
      const cached = await this.redis.get(POPULAR_EXPERIENCES_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err: any) {
      this.logger.warn(`Redis get "${POPULAR_EXPERIENCES_KEY}" failed: ${err.message}`);
    }

    // Cache miss or Redis unavailable: calculate, cache and return
    return this.calculateAndStorePopular('EXPERIENCE', 10);
  }

  async getMetadata(): Promise<any> {
    try {
      const cached = await this.redis.get(POPULAR_METADATA_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    return {
      lastCalculated: null,
      cronSchedule: '0 0 * * * (Midnight UTC)',
      frequency: 'Every 24 hours',
      keys: {
        stays: POPULAR_STAYS_KEY,
        experiences: POPULAR_EXPERIENCES_KEY,
      },
    };
  }

  // ── Helper: Format property document ───────────────────────────────────────

  private formatListingDoc(property: any) {
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
      })),
    };
  }
}
