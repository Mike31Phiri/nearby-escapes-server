import { Processor, WorkerHost } from '@nestjs/bullmq';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ReadStoreService } from './read-store.service';
import { ReadPropertyDocument } from './types/property-document.type';
import { PROPERTY_SYNC_QUEUE, PropertySyncJobData } from './property-sync.constants';

export { PROPERTY_SYNC_QUEUE } from './property-sync.constants';
export type { PropertySyncJobData } from './property-sync.constants';

@Processor(PROPERTY_SYNC_QUEUE)
export class PropertySyncWorker extends WorkerHost {
  private readonly logger = new Logger(PropertySyncWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ReadStoreService))
    private readonly readStore: ReadStoreService,
  ) {
    super();
  }

  async process(job: Job<PropertySyncJobData>): Promise<void> {
    const propertyId = job.data.propertyId || (job.data as any).listingId;
    const deleted = job.data.deleted;

    if (!propertyId) return;

    if (deleted) {
      await this.readStore.deleteProperty(propertyId);
      this.logger.log(`Removed property ${propertyId} from read store`);
      return;
    }

    // Full join query -- runs ONCE after every write
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

    // Pre-compute aggregates
    const ratings = property.reviews.map((r) => r.rating);
    const avgRating = ratings.length
      ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : 0;

    // Calculate starting price based on property type and units
    let startingPrice = 0;
    if (property.type === 'STAY') {
      const activeStays = property.stays.filter((s) => s.isActive);
      if (activeStays.length > 0) {
        startingPrice = Math.min(...activeStays.map((s) => s.price));
      }
    } else if (property.type === 'EXPERIENCE') {
      const activeExp = property.experiences.filter((e) => e.isActive);
      if (activeExp.length > 0) {
        startingPrice = Math.min(...activeExp.map((e) => e.price));
      }
    } else if (property.type === 'TRANSPORT') {
      const activeTrans = property.transports.filter((t) => t.isActive && t.pricePerSeat != null);
      if (activeTrans.length > 0) {
        startingPrice = Math.min(...activeTrans.map((t) => t.pricePerSeat!));
      }
    }

    const doc: ReadPropertyDocument = {
      id: property.id,
      type: property.type.toLowerCase() as 'stay' | 'experience' | 'transport',
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

      // Units
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
}

// Backwards compatibility alias
export const ListingSyncWorker = PropertySyncWorker;
