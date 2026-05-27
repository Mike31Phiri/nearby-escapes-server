import { PrismaService } from '../prisma/prisma.service';
export declare class HostDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(hostId: string): Promise<{
        stats: {
            totalListings: number;
            activeListings: number;
            totalBookings: number;
            pendingBookings: number;
            totalRevenue: number;
            averageRating: number;
            reviewCount: number;
        };
        recentBookings: {
            id: string;
            bookingRef: string;
            listingName: string | null;
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
            listingName: any;
            guestName: string | null;
            rating: number;
            text: string | null;
            createdAt: Date;
        }[];
        earningsByMonth: never[];
    }>;
    getEarnings(hostId: string): Promise<{
        total: number;
        monthly: {
            month: string;
            amount: number;
        }[];
    }>;
    getListings(hostId: string): Promise<{
        id: string;
        type: string;
        name: string;
        location: string;
        images: string[];
        price: number;
        status: string;
        totalBookings: number;
        averageRating: number;
        reviewCount: number;
        createdAt: Date;
    }[]>;
}
