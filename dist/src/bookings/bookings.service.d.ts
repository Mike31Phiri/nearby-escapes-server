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
        listingId: any;
        listingName: any;
        guestId: any;
        hostId: any;
        status: any;
        amount: any;
        currency: any;
        paymentStatus: any;
        details: {
            checkIn: any;
            checkOut: any;
            date: any;
            guests: any;
        };
        customer: {
            name: any;
            phone: any;
            email: any;
        };
        specialRequests: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findOne(id: string, userId: string, userRole: string): Promise<{
        id: any;
        bookingRef: any;
        type: any;
        listingId: any;
        listingName: any;
        guestId: any;
        hostId: any;
        status: any;
        amount: any;
        currency: any;
        paymentStatus: any;
        details: {
            checkIn: any;
            checkOut: any;
            date: any;
            guests: any;
        };
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
        listingId: any;
        listingName: any;
        guestId: any;
        hostId: any;
        status: any;
        amount: any;
        currency: any;
        paymentStatus: any;
        details: {
            checkIn: any;
            checkOut: any;
            date: any;
            guests: any;
        };
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
        listingId: any;
        listingName: any;
        guestId: any;
        hostId: any;
        status: any;
        amount: any;
        currency: any;
        paymentStatus: any;
        details: {
            checkIn: any;
            checkOut: any;
            date: any;
            guests: any;
        };
        customer: {
            name: any;
            phone: any;
            email: any;
        };
        specialRequests: any;
        createdAt: any;
        updatedAt: any;
    }>;
    private formatBooking;
}
