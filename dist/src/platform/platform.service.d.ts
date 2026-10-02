import { PrismaService } from '../prisma/prisma.service';
export declare class PlatformService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkHealth(): Promise<{
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
    getHealth(): Promise<{
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
    getPublicSettings(): Promise<Record<string, string>>;
    getBootstrap(): Promise<{
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
    getUserBootstrap(userId: string): Promise<{
        user: {
            role: string;
            joinedAt: Date;
            id: string;
            email: string;
            name: string;
            phone: string | null;
            avatar: string | null;
            createdAt: Date;
        } | null;
        unreadNotifications: number;
        wishlistCount: number;
        hostStatus: {
            hasProfile: boolean;
            isApproved: boolean;
            hostId: string;
            businessName: string | null;
            role: "host" | "host_pending";
        } | {
            hasProfile: boolean;
            isApproved: boolean;
            hostId: null;
            businessName: null;
            role: "guest";
        };
        recentBookings: {
            id: string;
            bookingRef: string;
            status: string;
            amount: number;
            amountFormatted: string;
            propertyName: string | null;
            listingName: string | null;
            propertyType: string | null;
            listingType: string | null;
            thumbnailUrl: any;
            createdAt: Date;
        }[];
    }>;
}
