import { UpdatePropertyPoliciesDto } from '../policies/dto/policy.dto';
import { PropertiesService } from '../properties/properties.service';
import { HostsService } from './hosts.service';
import { HostDashboardService } from './host-dashboard.service';
import { BookingsService } from '../bookings/bookings.service';
import { UpdateHostSettingsDto } from './dto/update-host-settings.dto';
import { HostOverviewDto } from './dto/host-overview.dto';
import { HostScheduleTodayDto, HostCheckInResponseDto, HostCheckOutResponseDto } from './dto/host-schedule.dto';
import { GetHostBookingsQueryDto, HostBookingListItemDto } from './dto/host-bookings.dto';
import { HostFinancesSummaryDto, AddHostPayoutMethodDto } from './dto/host-finances.dto';
import type { User } from '@prisma/client';
export declare class HostController {
    private propertiesService;
    private hostsService;
    private dashboardService;
    private bookingsService;
    constructor(propertiesService: PropertiesService, hostsService: HostsService, dashboardService: HostDashboardService, bookingsService: BookingsService);
    overview(user: User): Promise<HostOverviewDto>;
    scheduleToday(user: User): Promise<HostScheduleTodayDto>;
    getBookings(user: User, query: GetHostBookingsQueryDto): Promise<{
        data: HostBookingListItemDto[];
        meta: {
            page: number;
            limit: number;
        };
    }>;
    getBookingDetail(user: User, id: string): Promise<{
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
    getFinancesSummary(user: User): Promise<HostFinancesSummaryDto>;
    checkInSchedule(user: User, bookingId: string): Promise<HostCheckInResponseDto>;
    checkOutSchedule(user: User, bookingId: string): Promise<HostCheckOutResponseDto>;
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
    getListings(user: User, fields?: string): Promise<{
        id: any;
        name: any;
        type: any;
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
            property: {
                id: any;
                name: any;
                vertical: any;
                location: any;
                address: any;
                image: any;
            };
            host: {
                id: any;
                name: any;
                phone: any;
                whatsapp: any;
            };
            dates: {
                checkIn: string;
                checkOut: string;
                nights: number;
            };
            guests: {
                total: any;
                adults: any;
                children: number;
            };
            financials: {
                currency: any;
                nightlyRateNgwee: any;
                accommodationTotalNgwee: number;
                cleaningFeeNgwee: any;
                serviceFeeNgwee: number;
                taxesNgwee: number;
                grandTotalNgwee: any;
                paymentStatus: any;
            };
            instructions: {
                checkInProcedure: string;
                directions: string;
                houseRules: string[];
            };
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
            property: {
                id: any;
                name: any;
                vertical: any;
                location: any;
                address: any;
                image: any;
            };
            host: {
                id: any;
                name: any;
                phone: any;
                whatsapp: any;
            };
            dates: {
                checkIn: string;
                checkOut: string;
                nights: number;
            };
            guests: {
                total: any;
                adults: any;
                children: number;
            };
            financials: {
                currency: any;
                nightlyRateNgwee: any;
                accommodationTotalNgwee: number;
                cleaningFeeNgwee: any;
                serviceFeeNgwee: number;
                taxesNgwee: number;
                grandTotalNgwee: any;
                paymentStatus: any;
            };
            instructions: {
                checkInProcedure: string;
                directions: string;
                houseRules: string[];
            };
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
    addPayoutMethod(user: User, dto: AddHostPayoutMethodDto): Promise<{
        success: boolean;
        message: string;
        payoutMethod: {
            id: string;
            type: "bank_transfer" | "mobile_money";
            isDefault: boolean;
            details: import("./dto/host-finances.dto").HostPayoutMethodDetailsDto;
        };
    }>;
    removePayoutMethod(user: User, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    setDefaultPayoutMethod(user: User, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updatePropertyPolicies(user: User, propertyId: string, dto: UpdatePropertyPoliciesDto): Promise<{
        propertyId: string;
        updatedAt: string;
        cancellationSummary: string;
        rulesCount: number;
        depositRequired: boolean;
        success: boolean;
        message: string;
        data: {
            propertyId: string;
            updatedAt: string;
            cancellationSummary: string;
            rulesCount: number;
            depositRequired: boolean;
        };
    }>;
}
