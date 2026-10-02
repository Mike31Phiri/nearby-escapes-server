import { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare const POPULAR_STAYS_KEY = "popular:stays";
export declare const POPULAR_EXPERIENCES_KEY = "popular:experiences";
export declare const POPULAR_METADATA_KEY = "popular:metadata";
export declare class PopularityService implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly redis;
    constructor(prisma: PrismaService, config: ConfigService);
    onApplicationBootstrap(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    handleMidnightRecalculation(): Promise<void>;
    recalculateAll(): Promise<{
        stays: number;
        experiences: number;
        timestamp: string;
    }>;
    calculateAndStorePopular(type: 'STAY' | 'EXPERIENCE', limit?: number): Promise<any[]>;
    getPopularStays(): Promise<any[]>;
    getPopularExperiences(): Promise<any[]>;
    getMetadata(): Promise<any>;
    private formatListingDoc;
}
