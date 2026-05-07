import { PrismaService } from '../prisma/prisma.service';
export declare class HostDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(hostId: string): Promise<{
        host: {
            id: string;
            userId: string;
            displayName: string;
            businessName: string;
            verified: boolean;
        };
        stats: {
            totalEarnings: number;
            activeListings: number;
            upcomingBookings: number;
            averageRating: number;
        };
        recentBookings: ({
            user: {
                email: string;
                firstName: string;
                lastName: string;
            };
            items: {
                id: string;
                bookingId: string;
                itemType: import("@prisma/client").$Enums.BookingType;
                accommodationId: string | null;
                busId: string | null;
                attractionId: string | null;
                packageId: string | null;
                quantity: number;
                unitPrice: import("@prisma/client-runtime-utils").Decimal;
                subtotal: import("@prisma/client-runtime-utils").Decimal;
            }[];
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
            isGroupBooking: boolean;
            groupSize: number;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            approvalToken: string | null;
            confirmationId: string | null;
            checkIn: Date | null;
            checkOut: Date | null;
            guests: number;
            guestFirstName: string | null;
            guestLastName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
            specialRequests: string | null;
            cancelledAt: Date | null;
            refundAmount: import("@prisma/client-runtime-utils").Decimal | null;
        })[];
        listings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            name: string;
            hostId: string;
            description: string;
            pricePerNight: import("@prisma/client-runtime-utils").Decimal;
            totalRooms: number;
            availableRooms: number;
            maxGuests: number;
            amenities: string[];
            category: import("@prisma/client").$Enums.AccommodationCategory;
            photos: string[];
            cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        }[];
    }>;
    getEarnings(hostId: string): Promise<{
        total: number;
        monthly: {
            month: string;
            amount: number;
        }[];
    }>;
    getCalendar(hostId: string, listingId: string): Promise<{
        id: string;
        user: {
            firstName: string;
            lastName: string;
        };
        status: import("@prisma/client").$Enums.BookingStatus;
        confirmationId: string | null;
        checkIn: Date | null;
        checkOut: Date | null;
        guests: number;
    }[]>;
    getListings(hostId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        name: string;
        hostId: string;
        description: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
    }[]>;
}
