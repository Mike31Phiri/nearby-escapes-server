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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReadStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadStoreService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const config_1 = require("@nestjs/config");
const elasticsearch_1 = require("@elastic/elasticsearch");
const ioredis_1 = __importDefault(require("ioredis"));
const prisma_service_1 = require("../prisma/prisma.service");
const property_sync_constants_1 = require("./property-sync.constants");
const REDIS_KEY = (id) => `property:${id}`;
const ES_INDEX = 'properties';
let ReadStoreService = ReadStoreService_1 = class ReadStoreService {
    syncQueue;
    config;
    prisma;
    logger = new common_1.Logger(ReadStoreService_1.name);
    redis;
    es;
    constructor(syncQueue, config, prisma) {
        this.syncQueue = syncQueue;
        this.config = config;
        this.prisma = prisma;
        this.redis = new ioredis_1.default({
            host: config.get('REDIS_HOST') || 'localhost',
            port: config.get('REDIS_PORT') || 6379,
            lazyConnect: true,
        });
        this.redis.on('error', (err) => {
            this.logger.warn(`Redis connection warning: ${err.message}`);
        });
        this.es = new elasticsearch_1.Client({
            node: config.get('ELASTICSEARCH_URL') || 'http://localhost:9200',
            maxRetries: 1,
            requestTimeout: 2000,
        });
        this.ensureIndex();
    }
    async enqueueSync(propertyId, deleted = false) {
        await this.syncQueue.add(deleted ? 'delete' : 'upsert', { propertyId, deleted }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    }
    async upsertProperty(doc) {
        try {
            await this.redis.set(REDIS_KEY(doc.id), JSON.stringify(doc));
            await this.redis.set(`listing:${doc.id}`, JSON.stringify(doc));
        }
        catch (err) {
            this.logger.warn(`Redis set skipped: ${err.message}`);
        }
        try {
            await this.es.index({
                index: ES_INDEX,
                id: doc.id,
                document: doc,
            });
        }
        catch (err) {
            this.logger.warn(`Elasticsearch index skipped: ${err.message}`);
        }
    }
    async upsertListing(doc) {
        return this.upsertProperty(doc);
    }
    async deleteProperty(propertyId) {
        try {
            await this.redis.del(REDIS_KEY(propertyId));
            await this.redis.del(`listing:${propertyId}`);
        }
        catch { }
        try {
            await this.es.delete({ index: ES_INDEX, id: propertyId });
        }
        catch { }
    }
    async deleteListing(listingId) {
        return this.deleteProperty(listingId);
    }
    async getPropertyById(id) {
        try {
            const cached = (await this.redis.get(REDIS_KEY(id))) || (await this.redis.get(`listing:${id}`));
            if (cached)
                return JSON.parse(cached);
        }
        catch { }
        try {
            const result = await this.es.get({ index: ES_INDEX, id });
            const doc = result._source;
            try {
                await this.redis.set(REDIS_KEY(id), JSON.stringify(doc));
            }
            catch { }
            return doc;
        }
        catch { }
        return this.getPropertyFromDb(id);
    }
    async getListingById(id) {
        return this.getPropertyById(id);
    }
    async searchProperties(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const from = (page - 1) * limit;
        const must = [{ term: { status: 'active' } }];
        const filter = [];
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
            const rangeFilter = {};
            if (query.minPrice !== undefined)
                rangeFilter.gte = query.minPrice;
            if (query.maxPrice !== undefined)
                rangeFilter.lte = query.maxPrice;
            filter.push({ range: { price: rangeFilter } });
        }
        if (query.featured === 'gem') {
            filter.push({ range: { rating: { gte: 4 } } });
        }
        else if (query.featured === 'packages') {
            must.push({ term: { type: 'experience' } });
        }
        if (query.guests) {
            filter.push({ range: { 'stays.maxGuests': { gte: query.guests } } });
        }
        let sort = [{ createdAt: 'desc' }];
        if (query.sort === 'price_asc')
            sort = [{ price: 'asc' }];
        else if (query.sort === 'price_desc')
            sort = [{ price: 'desc' }];
        else if (query.sort === 'rating')
            sort = [{ rating: 'desc' }];
        else if (query.sort === 'newest')
            sort = [{ createdAt: 'desc' }];
        try {
            const response = await this.es.search({
                index: ES_INDEX,
                from,
                size: limit,
                query: { bool: { must, filter } },
                sort,
            });
            const hits = response.hits.hits;
            const total = typeof response.hits.total === 'number'
                ? response.hits.total
                : response.hits.total?.value || 0;
            return {
                data: hits.map((h) => h._source),
                meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            };
        }
        catch (err) {
            this.logger.warn(`Elasticsearch unavailable or empty (${err.message}). Serving from Postgres.`);
            return this.searchPropertiesFromDb(query);
        }
    }
    async searchListings(query) {
        return this.searchProperties(query);
    }
    async getPropertyFromDb(id) {
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
        if (!property || property.deletedAt)
            throw new common_1.NotFoundException('Property not found');
        return this.mapToDoc(property);
    }
    async searchPropertiesFromDb(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const where = { status: 'ACTIVE', deletedAt: null };
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
    mapToDoc(property) {
        const ratings = property.reviews.map((r) => r.rating);
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
            reviewCount: ratings.length,
            thumbnailUrl: property.images?.[0]?.url || null,
            images: (property.images || []).map((img) => ({ url: img.url, sortOrder: img.sortOrder })),
            amenities: (property.amenities || []).map((a) => ({ name: a.name, icon: a.icon })),
            rules: (property.rules || []).map((r) => r.rule),
            hostId: property.hostId,
            hostName: property.host?.businessName || property.host?.name || null,
            hostAvatar: property.host?.avatar || null,
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
            createdAt: property.createdAt.toISOString(),
            updatedAt: property.updatedAt.toISOString(),
        };
    }
    async ensureIndex() {
        try {
            const exists = await this.es.indices.exists({ index: ES_INDEX });
            if (exists)
                return;
            await this.es.indices.create({
                index: ES_INDEX,
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        type: { type: 'keyword' },
                        status: { type: 'keyword' },
                        name: { type: 'text', analyzer: 'standard' },
                        description: { type: 'text', analyzer: 'standard' },
                        location: { type: 'text', analyzer: 'standard', fields: { keyword: { type: 'keyword' } } },
                        price: { type: 'integer' },
                        currency: { type: 'keyword' },
                        rating: { type: 'float' },
                        reviewCount: { type: 'integer' },
                        hostId: { type: 'keyword' },
                        hostName: { type: 'text' },
                        thumbnailUrl: { type: 'keyword', index: false },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' },
                    },
                },
            });
            this.logger.log(`Elasticsearch index "${ES_INDEX}" created`);
        }
        catch (err) {
            this.logger.warn(`Could not ensure ES index: ${err.message}`);
        }
    }
};
exports.ReadStoreService = ReadStoreService;
exports.ReadStoreService = ReadStoreService = ReadStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(property_sync_constants_1.PROPERTY_SYNC_QUEUE)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], ReadStoreService);
//# sourceMappingURL=read-store.service.js.map