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
    myBookings(user: User, role?: string): Promise<{
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
    findOne(user: User, id: string): Promise<{
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
    cancel(user: User, id: string, dto?: CancelBookingDto): Promise<{
        status: string;
        refundEligible: boolean;
        refundAmount: number;
        policy: string;
        message: string;
    }>;
    updateStatus(user: User, id: string, status: 'CONFIRMED' | 'COMPLETED'): Promise<{
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
}
