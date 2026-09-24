import { HostsService } from './hosts.service';
import { HostDashboardService } from './host-dashboard.service';
import { BookingsService } from '../bookings/bookings.service';
import { UpdateHostSettingsDto } from './dto/update-host-settings.dto';
import type { User } from '@prisma/client';
export declare class HostController {
    private hostsService;
    private dashboardService;
    private bookingsService;
    constructor(hostsService: HostsService, dashboardService: HostDashboardService, bookingsService: BookingsService);
    dashboard(user: User): Promise<{
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
    earnings(user: User): Promise<{
        total: number;
        monthly: {
            month: string;
            amount: number;
        }[];
    }>;
    getListings(user: User): Promise<{
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
    getSettings(user: User): Promise<{
        businessName: string | null;
        defaultCheckInTime: string;
        defaultCheckOutTime: string;
        payoutMethod: string;
        payoutAccount: string | null;
        isApproved: boolean;
    }>;
    updateSettings(user: User, dto: UpdateHostSettingsDto): Promise<{
        message: string;
        settings: {
            businessName: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            payoutMethod: string;
            payoutAccount: string | null;
            isApproved: boolean;
        };
    }>;
    checkIn(user: User, id: string): Promise<{
        message: string;
        booking: {
            id: any;
            bookingRef: any;
            type: any;
            propertyId: any;
            propertyName: any;
            listingId: any;
            listingName: any;
            stayId: any;
            experienceId: any;
            transportId: any;
            timeSlot: any;
            unitName: any;
            guestId: any;
            hostId: any;
            status: any;
            amount: any;
            amountFormatted: string;
            currency: any;
            paymentStatus: any;
            hold: {
                isHoldActive: boolean;
                expiresAt: string | null;
                expiresInSeconds: number;
            };
            details: {
                checkIn: any;
                checkOut: any;
                date: any;
                timeSlot: any;
                guests: any;
            };
            checkedInAt: string | null;
            checkedOutAt: string | null;
            payout: {
                id: any;
                amount: any;
                commission: any;
                netAmount: any;
                status: any;
            } | null;
            customer: {
                name: any;
                phone: any;
                email: any;
            };
            specialRequests: any;
            createdAt: any;
            updatedAt: any;
        };
        payout: {
            id: string;
            amount: number;
            commission: number | null;
            netAmount: number | null;
            status: string;
            method: string | null;
        };
    }>;
    checkOut(user: User, id: string): Promise<{
        message: string;
        booking: {
            id: any;
            bookingRef: any;
            type: any;
            propertyId: any;
            propertyName: any;
            listingId: any;
            listingName: any;
            stayId: any;
            experienceId: any;
            transportId: any;
            timeSlot: any;
            unitName: any;
            guestId: any;
            hostId: any;
            status: any;
            amount: any;
            amountFormatted: string;
            currency: any;
            paymentStatus: any;
            hold: {
                isHoldActive: boolean;
                expiresAt: string | null;
                expiresInSeconds: number;
            };
            details: {
                checkIn: any;
                checkOut: any;
                date: any;
                timeSlot: any;
                guests: any;
            };
            checkedInAt: string | null;
            checkedOutAt: string | null;
            payout: {
                id: any;
                amount: any;
                commission: any;
                netAmount: any;
                status: any;
            } | null;
            customer: {
                name: any;
                phone: any;
                email: any;
            };
            specialRequests: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
}
