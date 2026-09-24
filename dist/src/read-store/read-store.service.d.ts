import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ReadPropertyDocument } from './types/property-document.type';
import { PropertySyncJobData } from './property-sync.constants';
export declare class ReadStoreService {
    private readonly syncQueue;
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private readonly redis;
    private readonly es;
    constructor(syncQueue: Queue<PropertySyncJobData>, config: ConfigService, prisma: PrismaService);
    enqueueSync(propertyId: string, deleted?: boolean): Promise<void>;
    upsertProperty(doc: ReadPropertyDocument): Promise<void>;
    upsertListing(doc: ReadPropertyDocument): Promise<void>;
    deleteProperty(propertyId: string): Promise<void>;
    deleteListing(listingId: string): Promise<void>;
    getPropertyById(id: string): Promise<ReadPropertyDocument>;
    getListingById(id: string): Promise<ReadPropertyDocument>;
    searchProperties(query: {
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
    }): Promise<{
        data: ReadPropertyDocument[];
        meta: any;
    }>;
    searchListings(query: any): Promise<{
        data: ReadPropertyDocument[];
        meta: any;
    }>;
    private getPropertyFromDb;
    private searchPropertiesFromDb;
    private mapToDoc;
    private ensureIndex;
}
