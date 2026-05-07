import { AdminService } from './admin.service';
import type { User } from '@prisma/client';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    dashboard(): Promise<{
        totalUsers: number;
        totalHosts: number;
        totalBookings: number;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
        pendingPayouts: number | import("@prisma/client-runtime-utils").Decimal;
    }>;
    bookingAnalytics(): Promise<{
        byStatus: {
            status: import("@prisma/client").$Enums.BookingStatus;
            count: number;
        }[];
        monthly: {
            month: string;
            count: number;
        }[];
    }>;
    paymentAnalytics(): Promise<{
        byStatus: {
            status: import("@prisma/client").$Enums.PaymentStatus;
            count: number;
            total: number | import("@prisma/client-runtime-utils").Decimal;
        }[];
        totalCommission: number | import("@prisma/client-runtime-utils").Decimal;
        monthly: {
            month: string;
            total: number;
        }[];
    }>;
    commissions(): Promise<{
        id: string;
        createdAt: Date;
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
        hostAmount: import("@prisma/client-runtime-utils").Decimal;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        commissionAmount: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    payouts(pending: string): Promise<({
        host: {
            user: {
                email: string;
            };
            businessName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        hostId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        isPaid: boolean;
        paidAt: Date | null;
    })[]>;
    markPaid(id: string): Promise<{
        id: string;
        createdAt: Date;
        hostId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        isPaid: boolean;
        paidAt: Date | null;
    }>;
    users(): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
    }[]>;
    bookings(): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            hostAmount: import("@prisma/client-runtime-utils").Decimal;
            bookingId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            commissionAmount: import("@prisma/client-runtime-utils").Decimal;
            provider: string | null;
            providerRef: string | null;
            receiptUrl: string | null;
        } | null;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
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
    })[]>;
    approveHost(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        businessName: string;
        isApproved: boolean;
    }>;
    promoteToAdmin(id: string, user: User): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
