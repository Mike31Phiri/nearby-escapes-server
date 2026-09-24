import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto/create-booking.dto';
import type { User } from '@prisma/client';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: User, dto: CreateBookingDto): Promise<{
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
    }>;
    myBookings(user: User, as?: string): Promise<{
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
    }[]>;
    findOne(user: User, id: string): Promise<{
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
    }>;
    cancel(user: User, id: string, dto?: CancelBookingDto): Promise<{
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
    updateStatus(user: User, id: string, status: 'CONFIRMED' | 'COMPLETED'): Promise<{
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
    }>;
}
