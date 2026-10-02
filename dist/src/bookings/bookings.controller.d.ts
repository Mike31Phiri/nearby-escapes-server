import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto/create-booking.dto';
import { GuestBookingsGroupedDto, GuestBookingItemDto, GetGuestBookingsQueryDto } from './dto/guest-bookings.dto';
import { HostCancelReservationDto, HostCancelReservationResponseDto } from './dto/host-cancel.dto';
import type { User } from '@prisma/client';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: User, dto: CreateBookingDto): Promise<{
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
    groupedBookings(user: User, userId?: string): Promise<GuestBookingsGroupedDto>;
    myTrips(user: User, userId?: string): Promise<GuestBookingsGroupedDto>;
    myBookings(user: User, query: GetGuestBookingsQueryDto & {
        as?: string;
    }): Promise<GuestBookingItemDto[]> | Promise<{
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
    findOne(user: User, id: string): Promise<{
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
    cancel(user: User, id: string, dto?: HostCancelReservationDto & CancelBookingDto): Promise<HostCancelReservationResponseDto | {
        status: string;
        refundEligible: boolean;
        refundAmount: number;
        policy: string;
        message: string;
    }>;
    releaseHold(user: User, id: string): Promise<{
        success: boolean;
        message: string;
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
    updateStatus(user: User, id: string, status: 'CONFIRMED' | 'COMPLETED'): Promise<{
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
}
