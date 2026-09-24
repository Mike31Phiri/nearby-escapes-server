import { PrismaService } from '../prisma/prisma.service';
export declare class HostDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(userId: string): Promise<{
        stats: {
            totalListings: number;
            activeListings: number;
            totalBookings: number;
            pendingBookings: number;
            totalRevenue: number;
            averageRating: number;
            reviewCount: number;
            totalProperties?: undefined;
            activeProperties?: undefined;
        };
        recentBookings: never[];
        recentReviews: never[];
        earningsByMonth: never[];
    } | {
        stats: {
            totalListings: number;
            totalProperties: number;
            activeListings: number;
            activeProperties: number;
            totalBookings: number;
            pendingBookings: number;
            totalRevenue: number;
            averageRating: number;
            reviewCount: number;
        };
        recentBookings: {
            id: string;
            bookingRef: string;
            propertyName: string | null;
            listingName: string | null;
            thumbnailUrl: any;
            guestName: string | null;
            guests: number;
            checkIn: Date | null;
            checkOut: Date | null;
            status: string;
            amount: number;
            createdAt: Date;
        }[];
        recentReviews: {
            id: string;
            propertyName: any;
            listingName: any;
            guestName: string | null;
            rating: number;
            text: string | null;
            createdAt: Date;
        }[];
        earningsByMonth: never[];
    }>;
    getEarnings(userId: string): Promise<{
        total: number;
        monthly: {
            month: string;
            amount: number;
        }[];
    }>;
    getProperties(userId: string): Promise<{
        id: string;
        propertyId: string;
        listingId: string;
        type: string;
        name: string;
        location: string;
        thumbnailUrl: any;
        price: number;
        priceFormatted: string;
        status: string;
        totalBookings: number;
        averageRating: number;
        reviewCount: number;
        unitsCount: number;
        createdAt: Date;
    }[]>;
    getListings(userId: string): Promise<{
        id: string;
        propertyId: string;
        listingId: string;
        type: string;
        name: string;
        location: string;
        thumbnailUrl: any;
        price: number;
        priceFormatted: string;
        status: string;
        totalBookings: number;
        averageRating: number;
        reviewCount: number;
        unitsCount: number;
        createdAt: Date;
    }[]>;
}
