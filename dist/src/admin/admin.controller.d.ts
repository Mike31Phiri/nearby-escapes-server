import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    dashboard(): Promise<{
        stats: {
            totalUsers: number;
            totalHosts: number;
            totalGuests: number;
            totalListings: number;
            totalBookings: number;
            totalRevenue: number;
            pendingDisputes: number;
        };
        recentUsers: {
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
            createdAt: Date;
        }[];
        recentBookings: {
            id: string;
            bookingRef: string;
            propertyName: string | null;
            listingName: string | null;
            guestName: string | null;
            status: string;
            amount: number;
            createdAt: Date;
        }[];
        revenueByMonth: {
            month: string;
            amount: number;
        }[];
    }>;
    getUsers(page?: number, limit?: number, search?: string): Promise<{
        data: {
            role: string;
            verificationStatus: string;
            email: string;
            name: string;
            phone: string | null;
            id: string;
            avatar: string | null;
            isVerified: boolean;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUserStatus(id: string, status: string): Promise<{
        email: string;
        name: string;
        id: string;
        isVerified: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
    }>;
    getProperties(page?: number, limit?: number, status?: string): Promise<{
        data: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            hostName: string | null;
            location: string;
            price: number;
            priceFormatted: string;
            status: string;
            bookingsCount: number;
            reviewsCount: number;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getListings(page?: number, limit?: number, status?: string): Promise<{
        data: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            hostName: string | null;
            location: string;
            price: number;
            priceFormatted: string;
            status: string;
            bookingsCount: number;
            reviewsCount: number;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updatePropertyStatus(id: string, status: string, reason?: string): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
    updateListingStatus(id: string, status: string, reason?: string): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
    getBookings(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            bookingRef: string;
            propertyName: string | null;
            listingName: string | null;
            propertyType: string | null;
            listingType: string | null;
            guestName: string | null;
            guestEmail: string | null;
            amount: number;
            status: string;
            paymentStatus: string;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDisputes(page?: number, limit?: number): Promise<{
        data: {
            status: string;
            priority: string;
            description: string | null;
            id: string;
            hostId: string;
            bookingRef: string;
            guestId: string;
            amount: number;
            propertyName: string;
            propertyType: string;
            guestName: string;
            hostName: string;
            reason: string;
            raisedBy: string;
            raisedAt: Date;
            resolvedAt: Date | null;
            resolution: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateDispute(id: string, status: string, resolution?: string): Promise<{
        status: string;
        priority: string;
        description: string | null;
        id: string;
        hostId: string;
        bookingRef: string;
        guestId: string;
        amount: number;
        propertyName: string;
        propertyType: string;
        guestName: string;
        hostName: string;
        reason: string;
        raisedBy: string;
        raisedAt: Date;
        resolvedAt: Date | null;
        resolution: string | null;
    }>;
    getPayouts(page?: number, limit?: number, status?: string): Promise<{
        data: {
            id: string;
            hostName: string | null;
            hostEmail: string | null;
            amount: number;
            commission: number | null;
            netAmount: number | null;
            period: string | null;
            status: string;
            method: string | null;
            bookingCount: number;
            processedAt: Date | null;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    processPayouts(payoutIds: string[]): Promise<{
        processed: number;
        failed: number;
        totalAmount: number;
    }>;
    getActivity(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            action: string;
            user: string;
            userRole: string | null;
            target: string | null;
            type: string;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getReports(): Promise<{
        monthlyData: {
            month: string;
            newUsers: number;
            newBookings: number;
            revenue: number;
            commission: number;
        }[];
        platformStats: {
            totalUsers: number;
            totalGuests: number;
            totalHosts: number;
            totalListings: number;
            activeListings: number;
            totalBookings: number;
            completedBookings: number;
            totalRevenue: number;
            platformCommission: number;
            avgRating: number;
            reviewCount: number;
            growthRate: number;
            pendingModeration: number;
            reportedListings: number;
        };
    }>;
    getSettings(): Promise<{
        settings: {
            type: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            key: string;
            label: string;
            value: string;
            options: string[];
        }[];
    }>;
    updateSettings(settings: {
        key: string;
        value: string;
    }[]): Promise<{
        updated: number;
        settings: {
            type: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            key: string;
            label: string;
            value: string;
            options: string[];
        }[];
    }>;
    approveHost(id: string): Promise<{
        email: string;
        password: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        avatar: string | null;
        homeCity: string | null;
        bio: string | null;
        isVerified: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        businessName: string | null;
        isApproved: boolean;
        defaultCheckInTime: string | null;
        defaultCheckOutTime: string | null;
        payoutMethod: string | null;
        payoutAccount: string | null;
        resetToken: string | null;
        resetTokenExpiry: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    promoteToAdmin(id: string): Promise<{
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        id: string;
    }>;
}
