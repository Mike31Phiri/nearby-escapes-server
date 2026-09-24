import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';
export declare class BookingsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    create(userId: string, dto: CreateBookingDto): Promise<{
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
    releaseHold(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: string, userId: string, userRole: string): Promise<{
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
    findMyBookings(userId: string, role?: string): Promise<{
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
    cancel(id: string, userId: string, reason?: string): Promise<{
        status: string;
        refundEligible: boolean;
        refundAmount: number;
        policy: string;
        message: string;
    }>;
    updateStatus(id: string, userId: string, status: BookingStatus): Promise<{
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
    checkIn(id: string, userId: string): Promise<{
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
    checkOut(id: string, userId: string): Promise<{
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
    private formatBooking;
}
