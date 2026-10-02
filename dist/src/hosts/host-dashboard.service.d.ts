import { PrismaService } from '../prisma/prisma.service';
import { HostOverviewDto } from './dto/host-overview.dto';
import { HostScheduleTodayDto } from './dto/host-schedule.dto';
import { GetHostBookingsQueryDto, HostBookingListItemDto } from './dto/host-bookings.dto';
import { HostFinancesSummaryDto } from './dto/host-finances.dto';
export declare class HostDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    private formatDateOnly;
    getBookings(userId: string, query: GetHostBookingsQueryDto): Promise<HostBookingListItemDto[]>;
    getFinancesSummary(userId: string): Promise<HostFinancesSummaryDto>;
    getOverview(userId: string): Promise<HostOverviewDto>;
    getTodaySchedule(userId: string): Promise<HostScheduleTodayDto>;
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
        location: string | null;
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
        location: string | null;
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
    getBookingDetail(hostId: string, bookingId: string): Promise<{
        id: string;
        bookingRef: string;
        listingId: string;
        listingName: string;
        listingType: "stay" | "experience" | "transport";
        listingImage: any;
        status: string;
        paymentStatus: string;
        guestName: string;
        guestEmail: string;
        guestPhone: string;
        guests: number;
        checkIn: string | null;
        checkOut: string | null;
        timeSlot: string | null;
        stayProgress: string | null;
        createdAt: string;
        pricing: {
            currency: string;
            baseRateNgwee: number;
            nightsCount: number;
            subtotalNgwee: number;
            cleaningFeeNgwee: number;
            serviceFeeNgwee: number;
            totalAmountNgwee: number;
        };
        specialRequests: string | null;
    }>;
}
