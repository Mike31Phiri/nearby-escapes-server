import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ReadStoreService } from './read-store.service';
import { PropertySyncJobData } from './property-sync.constants';
export { PROPERTY_SYNC_QUEUE } from './property-sync.constants';
export type { PropertySyncJobData } from './property-sync.constants';
export declare class PropertySyncWorker extends WorkerHost {
    private readonly prisma;
    private readonly readStore;
    private readonly logger;
    constructor(prisma: PrismaService, readStore: ReadStoreService);
    process(job: Job<PropertySyncJobData>): Promise<void>;
}
export declare const ListingSyncWorker: typeof PropertySyncWorker;
