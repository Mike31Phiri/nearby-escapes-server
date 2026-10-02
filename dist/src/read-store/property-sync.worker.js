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
var PropertySyncWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingSyncWorker = exports.PropertySyncWorker = exports.PROPERTY_SYNC_QUEUE = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const read_store_service_1 = require("./read-store.service");
const property_sync_constants_1 = require("./property-sync.constants");
var property_sync_constants_2 = require("./property-sync.constants");
Object.defineProperty(exports, "PROPERTY_SYNC_QUEUE", { enumerable: true, get: function () { return property_sync_constants_2.PROPERTY_SYNC_QUEUE; } });
let PropertySyncWorker = PropertySyncWorker_1 = class PropertySyncWorker extends bullmq_1.WorkerHost {
    prisma;
    readStore;
    logger = new common_1.Logger(PropertySyncWorker_1.name);
    constructor(prisma, readStore) {
        super();
        this.prisma = prisma;
        this.readStore = readStore;
    }
    async process(job) {
        const propertyId = job.data.propertyId || job.data.listingId;
        const deleted = job.data.deleted;
        if (!propertyId)
            return;
        if (deleted) {
            await this.readStore.deleteProperty(propertyId);
            this.logger.log(`Removed property ${propertyId} from read store`);
            return;
        }
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                host: { select: { name: true, avatar: true } },
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
            },
        });
        if (!property || property.deletedAt || property.status !== 'ACTIVE') {
            await this.readStore.deleteProperty(propertyId);
            return;
        }
        const ratings = property.reviews.map((r) => r.rating);
        const avgRating = ratings.length
            ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 0;
        let startingPrice = 0;
        if (property.type === 'STAY') {
            const activeStays = property.stays.filter((s) => s.isActive);
            if (activeStays.length > 0) {
                startingPrice = Math.min(...activeStays.map((s) => s.price));
            }
        }
        else if (property.type === 'EXPERIENCE') {
            const activeExp = property.experiences.filter((e) => e.isActive);
            if (activeExp.length > 0) {
                startingPrice = Math.min(...activeExp.map((e) => e.price));
            }
        }
        else if (property.type === 'TRANSPORT') {
            const activeTrans = property.transports.filter((t) => t.isActive && t.pricePerSeat != null);
            if (activeTrans.length > 0) {
                startingPrice = Math.min(...activeTrans.map((t) => t.pricePerSeat));
            }
        }
        const doc = {
            id: property.id,
            type: property.type.toLowerCase(),
            status: property.status.toLowerCase(),
            name: property.name,
            description: property.description || '',
            location: property.location || '',
            currency: property.currency,
            price: startingPrice,
            priceFormatted: `K${(startingPrice / 100).toFixed(2)}`,
            rating: avgRating,
            reviewCount: ratings.length,
            thumbnailUrl: property.images[0]?.url || null,
            images: property.images.map((img) => ({ url: img.url, sortOrder: img.sortOrder })),
            amenities: property.amenities.map((a) => ({ name: a.name, icon: a.icon })),
            rules: property.rules.map((r) => r.rule),
            hostId: property.hostId,
            hostName: property.host?.name || null,
            hostAvatar: property.host?.avatar || null,
            stays: property.stays.map((s) => ({
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
            experiences: property.experiences.map((e) => ({
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
                timeSlots: e.timeSlots.map((ts) => ts.slot),
                inclusions: e.inclusions.map((i) => i.item),
            })),
            transports: property.transports.map((t) => ({
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
        await this.readStore.upsertProperty(doc);
        this.logger.log(`Synced property ${propertyId} to read store`);
    }
};
exports.PropertySyncWorker = PropertySyncWorker;
exports.PropertySyncWorker = PropertySyncWorker = PropertySyncWorker_1 = __decorate([
    (0, bullmq_1.Processor)(property_sync_constants_1.PROPERTY_SYNC_QUEUE),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => read_store_service_1.ReadStoreService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        read_store_service_1.ReadStoreService])
], PropertySyncWorker);
exports.ListingSyncWorker = PropertySyncWorker;
//# sourceMappingURL=property-sync.worker.js.map