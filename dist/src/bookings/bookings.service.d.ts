import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GuestBookingItemDto, GuestBookingsGroupedDto, GetGuestBookingsQueryDto } from './dto/guest-bookings.dto';
import { HostCancelReservationResponseDto } from './dto/host-cancel.dto';
import { BookingStatus } from '@prisma/client';
export declare class BookingsService {
    private prisma;
    private notifications;
    private readStore;
    constructor(prisma: PrismaService, notifications: NotificationsService, readStore: ReadStoreService);
    private formatDateOnly;
    private toGuestBookingItem;
    getGuestBookingsGrouped(userId: string): Promise<GuestBookingsGroupedDto>;
    getGuestBookings(userId: string, query: GetGuestBookingsQueryDto): Promise<GuestBookingItemDto[]>;
    create(userId: string, dto: CreateBookingDto): Promise<{
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
    }>;
    releaseHold(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: string, userId: string, userRole: string): Promise<{
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
    }>;
    findMyBookings(userId: string, role?: string): Promise<{
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
    }[]>;
    cancel(idOrBookingRef: string, userId: string, reason?: string): Promise<{
        status: string;
        refundEligible: boolean;
        refundAmount: number;
        policy: string;
        message: string;
    }>;
    hostCancel(bookingRefOrId: string, hostId: string, reason?: string): Promise<HostCancelReservationResponseDto>;
    updateStatus(id: string, userId: string, status: BookingStatus): Promise<{
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
    }>;
    checkIn(idOrBookingRef: string, userId: string): Promise<{
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
    checkOut(idOrBookingRef: string, userId: string): Promise<{
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
    private formatBooking;
}
