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
        try {
            await this.syncQueue.add(deleted ? 'delete' : 'upsert', { propertyId, deleted }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
        }
        catch (err) {
            this.logger.warn(`Redis/Queue sync skipped for property ${propertyId}: ${err?.message}`);
        }
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
            if (cached) {
                const doc = JSON.parse(cached);
                if (doc.status?.toLowerCase() !== 'active') {
                    throw new common_1.NotFoundException('Property not found');
                }
                return doc;
            }
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
        }
        try {
            const result = await this.es.get({ index: ES_INDEX, id });
            const doc = result._source;
            if (doc.status?.toLowerCase() !== 'active') {
                throw new common_1.NotFoundException('Property not found');
            }
            try {
                await this.redis.set(REDIS_KEY(id), JSON.stringify(doc));
            }
            catch { }
            return doc;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
        }
        return this.getPropertyFromDb(id);
    }
    async getListingById(id) {
        return this.getPropertyById(id);
    }
    async searchProperties(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
        const from = (page - 1) * limit;
        const must = [{ term: { status: 'active' } }];
        const filter = [];
        const typeFilter = query.vertical || query.type;
        if (typeFilter && typeFilter !== 'all') {
            must.push({ term: { type: typeFilter.toLowerCase() } });
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
        if (query.city) {
            must.push({ match: { location: { query: query.city, fuzziness: 'AUTO' } } });
        }
        if (query.province) {
            must.push({ match: { location: { query: query.province, fuzziness: 'AUTO' } } });
        }
        if (query.location && !query.q && !query.city && !query.province) {
            must.push({ match: { location: { query: query.location, fuzziness: 'AUTO' } } });
        }
        const minP = query.minPriceNgwee !== undefined ? Number(query.minPriceNgwee) : query.minPrice !== undefined ? Number(query.minPrice) : undefined;
        const maxP = query.maxPriceNgwee !== undefined ? Number(query.maxPriceNgwee) : query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;
        if (minP !== undefined || maxP !== undefined) {
            const rangeFilter = {};
            if (minP !== undefined)
                rangeFilter.gte = minP;
            if (maxP !== undefined)
                rangeFilter.lte = maxP;
            filter.push({ range: { price: rangeFilter } });
        }
        if (query.featured === 'gem') {
            filter.push({ range: { rating: { gte: 4 } } });
        }
        else if (query.featured === 'packages') {
            must.push({ term: { type: 'experience' } });
        }
        if (query.guests) {
            filter.push({ range: { 'stays.maxGuests': { gte: Number(query.guests) } } });
        }
        let sort = [{ createdAt: 'desc' }];
        if (query.sort === 'price_asc')
            sort = [{ price: 'asc' }];
        else if (query.sort === 'price_desc')
            sort = [{ price: 'desc' }];
        else if (query.sort === 'rating')
            sort = [{ rating: 'desc' }];
        else if (query.sort === 'popular')
            sort = [{ reviewCount: 'desc' }];
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
                host: { select: { id: true, name: true, avatar: true, businessName: true, isApproved: true } },
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
            throw new common_1.NotFoundException('Property not found');
        }
        return this.mapToDoc(property);
    }
    async searchPropertiesFromDb(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
        const skip = (page - 1) * limit;
        const where = { status: 'ACTIVE', deletedAt: null };
        const typeFilter = query.vertical || query.type;
        if (typeFilter && typeFilter !== 'all') {
            where.type = typeFilter.toUpperCase();
        }
        const searchTerms = [];
        if (query.q) {
            searchTerms.push({ name: { contains: query.q, mode: 'insensitive' } }, { description: { contains: query.q, mode: 'insensitive' } }, { location: { contains: query.q, mode: 'insensitive' } });
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
                .map((a) => a.trim())
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
                    host: { select: { id: true, name: true, avatar: true, businessName: true, isApproved: true } },
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
        if (minP !== undefined)
            docs = docs.filter((d) => d.price >= minP);
        if (maxP !== undefined)
            docs = docs.filter((d) => d.price <= maxP);
        if (query.sort === 'price_asc') {
            docs.sort((a, b) => a.price - b.price);
        }
        else if (query.sort === 'price_desc') {
            docs.sort((a, b) => b.price - a.price);
        }
        else if (query.sort === 'rating') {
            docs.sort((a, b) => b.rating - a.rating);
        }
        else if (query.sort === 'popular') {
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
        const locationParts = (property.location || '')
            .split(',')
            .map((s) => s.trim())
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
            images: (property.images || []).map((img) => ({ url: img.url, sortOrder: img.sortOrder })),
            amenities: (property.amenities || []).map((a) => ({ name: a.name, icon: a.icon })),
            rules: (property.rules || []).map((r) => r.rule),
            hostId: property.hostId,
            hostName: property.host?.businessName || property.host?.name || null,
            hostAvatar: property.host?.avatar || null,
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
                name: property.host?.businessName || property.host?.name || null,
                avatarUrl: property.host?.avatar || null,
                superhost: Boolean(property.host?.isApproved),
            },
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