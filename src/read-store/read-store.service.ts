import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { ReadPropertyDocument, ReadListingDocument } from './types/property-document.type';
import { PROPERTY_SYNC_QUEUE, PropertySyncJobData } from './property-sync.constants';

const REDIS_KEY = (id: string) => `property:${id}`;
const ES_INDEX = 'properties';

@Injectable()
export class ReadStoreService {
  private readonly logger = new Logger(ReadStoreService.name);
  private readonly redis: Redis;
  private readonly es: ElasticsearchClient;

  constructor(
    @InjectQueue(PROPERTY_SYNC_QUEUE) private readonly syncQueue: Queue<PropertySyncJobData>,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST') || 'localhost',
      port: config.get<number>('REDIS_PORT') || 6379,
      lazyConnect: true,
    });

    this.redis.on('error', (err) => {
      this.logger.warn(`Redis connection warning: ${err.message}`);
    });

    this.es = new ElasticsearchClient({
      node: config.get<string>('ELASTICSEARCH_URL') || 'http://localhost:9200',
      maxRetries: 1,
      requestTimeout: 2000,
    });

    this.ensureIndex();
  }

  // ── Queue helpers ────────────────────────────────────────────────────────────

  async enqueueSync(propertyId: string, deleted = false): Promise<void> {
    await this.syncQueue.add(
      deleted ? 'delete' : 'upsert',
      { propertyId, deleted },
      { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    );
  }

  // ── Write side (called by worker) ────────────────────────────────────────────

  async upsertProperty(doc: ReadPropertyDocument): Promise<void> {
    // 1. Write to Redis
    try {
      await this.redis.set(REDIS_KEY(doc.id), JSON.stringify(doc));
      await this.redis.set(`listing:${doc.id}`, JSON.stringify(doc));
    } catch (err) {
      this.logger.warn(`Redis set skipped: ${err.message}`);
    }

    // 2. Index in Elasticsearch
    try {
      await this.es.index({
        index: ES_INDEX,
        id: doc.id,
        document: doc,
      });
    } catch (err) {
      this.logger.warn(`Elasticsearch index skipped: ${err.message}`);
    }
  }

  async upsertListing(doc: ReadPropertyDocument): Promise<void> {
    return this.upsertProperty(doc);
  }

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      await this.redis.del(REDIS_KEY(propertyId));
      await this.redis.del(`listing:${propertyId}`);
    } catch {}
    try {
      await this.es.delete({ index: ES_INDEX, id: propertyId });
    } catch {}
  }

  async deleteListing(listingId: string): Promise<void> {
    return this.deleteProperty(listingId);
  }

  // ── Read side (called by controller) ────────────────────────────────────────

  async getPropertyById(id: string): Promise<ReadPropertyDocument> {
    // Redis first -- sub-ms lookup
    try {
      const cached = (await this.redis.get(REDIS_KEY(id))) || (await this.redis.get(`listing:${id}`));
      if (cached) return JSON.parse(cached) as ReadPropertyDocument;
    } catch {}

    // Fallback 1: Elasticsearch
    try {
      const result = await this.es.get<ReadPropertyDocument>({ index: ES_INDEX, id });
      const doc = result._source as ReadPropertyDocument;
      try {
        await this.redis.set(REDIS_KEY(id), JSON.stringify(doc));
      } catch {}
      return doc;
    } catch {}

    // Fallback 2: Direct Database query (for local dev or cache miss)
    return this.getPropertyFromDb(id);
  }

  async getListingById(id: string): Promise<ReadPropertyDocument> {
    return this.getPropertyById(id);
  }

  async searchProperties(query: {
    type?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    sort?: string;
    page?: number;
    limit?: number;
    featured?: string;
    q?: string;
  }): Promise<{ data: ReadPropertyDocument[]; meta: any }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const from = (page - 1) * limit;

    const must: any[] = [{ term: { status: 'active' } }];
    const filter: any[] = [];

    if (query.type && query.type !== 'all') {
      must.push({ term: { type: query.type.toLowerCase() } });
    }

    if (query.q) {
      must.push({
        multi_match: {
          query: query.q,
          fields: ['name^3', 'description', 'location^2', 'stays.name', 'experiences.name', 'transports.name'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (query.location && !query.q) {
      must.push({ match: { location: { query: query.location, fuzziness: 'AUTO' } } });
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const rangeFilter: any = {};
      if (query.minPrice !== undefined) rangeFilter.gte = query.minPrice;
      if (query.maxPrice !== undefined) rangeFilter.lte = query.maxPrice;
      filter.push({ range: { price: rangeFilter } });
    }

    if (query.featured === 'gem') {
      filter.push({ range: { rating: { gte: 4 } } });
    } else if (query.featured === 'packages') {
      must.push({ term: { type: 'experience' } });
    }

    if (query.guests) {
      filter.push({ range: { 'stays.maxGuests': { gte: query.guests } } });
    }

    let sort: any[] = [{ createdAt: 'desc' }];
    if (query.sort === 'price_asc') sort = [{ price: 'asc' }];
    else if (query.sort === 'price_desc') sort = [{ price: 'desc' }];
    else if (query.sort === 'rating') sort = [{ rating: 'desc' }];
    else if (query.sort === 'newest') sort = [{ createdAt: 'desc' }];

    try {
      const response = await this.es.search<ReadPropertyDocument>({
        index: ES_INDEX,
        from,
        size: limit,
        query: { bool: { must, filter } },
        sort,
      });

      const hits = response.hits.hits;
      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : (response.hits.total as any)?.value || 0;

      return {
        data: hits.map((h) => h._source as ReadPropertyDocument),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (err) {
      this.logger.warn(`Elasticsearch unavailable or empty (${err.message}). Serving from Postgres.`);
      return this.searchPropertiesFromDb(query);
    }
  }

  async searchListings(query: any) {
    return this.searchProperties(query);
  }

  // ── Database Fallbacks (High resilience) ─────────────────────────────────────

  private async getPropertyFromDb(id: string): Promise<ReadPropertyDocument> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        host: { select: { name: true, avatar: true, businessName: true } },
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

    if (!property || property.deletedAt) throw new NotFoundException('Property not found');
    return this.mapToDoc(property);
  }

  private async searchPropertiesFromDb(query: {
    type?: string;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = { status: 'ACTIVE', deletedAt: null };
    if (query.type && query.type !== 'all') {
      where.type = query.type.toUpperCase();
    }
    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          host: { select: { name: true, avatar: true, businessName: true } },
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

    return {
      data: properties.map((p) => this.mapToDoc(p)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapToDoc(property: any): ReadPropertyDocument {
    const ratings = property.reviews.map((r: any) => r.rating);
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
      reviewCount: ratings.length,
      thumbnailUrl: property.images?.[0]?.url || null,
      images: (property.images || []).map((img: any) => ({ url: img.url, sortOrder: img.sortOrder })),
      amenities: (property.amenities || []).map((a: any) => ({ name: a.name, icon: a.icon })),
      rules: (property.rules || []).map((r: any) => r.rule),
      hostId: property.hostId,
      hostName: property.host?.businessName || property.host?.name || null,
      hostAvatar: property.host?.avatar || null,
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

  // ── Elasticsearch index setup ────────────────────────────────────────────────

  private async ensureIndex(): Promise<void> {
    try {
      const exists = await this.es.indices.exists({ index: ES_INDEX });
      if (exists) return;

      await this.es.indices.create({
        index: ES_INDEX,
        mappings: {
          properties: {
            id:           { type: 'keyword' },
            type:         { type: 'keyword' },
            status:       { type: 'keyword' },
            name:         { type: 'text', analyzer: 'standard' },
            description:  { type: 'text', analyzer: 'standard' },
            location:     { type: 'text', analyzer: 'standard', fields: { keyword: { type: 'keyword' } } },
            price:        { type: 'integer' },
            currency:     { type: 'keyword' },
            rating:       { type: 'float' },
            reviewCount:  { type: 'integer' },
            hostId:       { type: 'keyword' },
            hostName:     { type: 'text' },
            thumbnailUrl: { type: 'keyword', index: false },
            createdAt:    { type: 'date' },
            updatedAt:    { type: 'date' },
          },
        },
      });

      this.logger.log(`Elasticsearch index "${ES_INDEX}" created`);
    } catch (err) {
      this.logger.warn(`Could not ensure ES index: ${err.message}`);
    }
  }
}
