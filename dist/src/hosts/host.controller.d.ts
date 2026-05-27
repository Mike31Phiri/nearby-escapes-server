import { HostsService } from './hosts.service';
import { HostDashboardService } from './host-dashboard.service';
import type { User } from '@prisma/client';
export declare class HostController {
    private hostsService;
    private dashboardService;
    constructor(hostsService: HostsService, dashboardService: HostDashboardService);
    dashboard(user: User): Promise<{
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
    earnings(user: User): Promise<{
        total: number;
        monthly: {
            month: string;
            amount: number;
        }[];
    }>;
    getListings(user: User): Promise<{
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
