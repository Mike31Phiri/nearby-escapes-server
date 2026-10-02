import { PlatformService } from './platform.service';
export declare class PlatformController {
    private readonly platformService;
    constructor(platformService: PlatformService);
    health(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
        database: {
            status: string;
            latencyMs: number;
        };
        memory: {
            heapUsedMb: number;
            heapTotalMb: number;
            rssMb: number;
        };
    }>;
    bootstrap(req: any): Promise<{
        stats: {
            totalUsers: number;
            totalHosts: number;
            totalGuests: number;
            totalListings: number;
            totalProperties: number;
            activeListings: number;
            activeProperties: number;
            totalBookings: number;
            completedBookings: number;
            avgRating: number;
            reviewCount: number;
            totalRevenue: number;
            platformCommission: number;
        };
        featured: {
            gems: {
                id: string;
                propertyId: string;
                listingId: string;
                type: string;
                name: string;
                location: string | null;
                thumbnailUrl: any;
                price: number;
                priceFormatted: string;
                currency: string;
                rating: number;
                reviewCount: number;
                hostName: string | null;
            }[];
        };
        locations: (string | null)[];
        settings: Record<string, string>;
    }>;
}
