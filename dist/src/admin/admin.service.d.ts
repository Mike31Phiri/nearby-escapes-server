import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AdminService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
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
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
        }[];
        recentBookings: {
            id: string;
            bookingRef: string;
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
            id: string;
            email: string;
            name: string;
            phone: string | null;
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
    updateUserStatus(userId: string, status: string): Promise<{
        id: string;
        email: string;
        name: string;
        isVerified: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
    }>;
    getListings(page?: number, limit?: number, status?: string): Promise<{
        data: {
            id: string;
            type: string;
            name: string;
            hostName: string | null;
            location: string;
            price: number;
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
    updateListingStatus(listingId: string, status: string, reason?: string): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
    getBookings(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            bookingRef: string;
            listingName: string | null;
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
            id: string;
            guestId: string;
            bookingRef: string;
            hostId: string;
            amount: number;
            description: string | null;
            listingType: string;
            reason: string;
            listingName: string;
            guestName: string;
            hostName: string;
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
    updateDispute(disputeId: string, status: string, resolution?: string): Promise<{
        status: string;
        priority: string;
        id: string;
        guestId: string;
        bookingRef: string;
        hostId: string;
        amount: number;
        description: string | null;
        listingType: string;
        reason: string;
        listingName: string;
        guestName: string;
        hostName: string;
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
    getPromotions(page?: number, limit?: number): Promise<{
        data: {
            type: string;
            id: string;
            createdAt: Date;
            description: string | null;
            code: string;
            value: number;
            minSpend: number | null;
            maxUses: number;
            currentUses: number;
            appliesTo: string;
            isActive: boolean;
            startsAt: Date;
            expiresAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createPromotion(data: {
        code: string;
        type: string;
        value: number;
        minSpend?: number;
        maxUses: number;
        appliesTo?: string;
        isActive: boolean;
        startsAt: string;
        expiresAt: string;
        description?: string;
    }): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        description: string | null;
        code: string;
        value: number;
        minSpend: number | null;
        maxUses: number;
        currentUses: number;
        appliesTo: string;
        isActive: boolean;
        startsAt: Date;
        expiresAt: Date;
    }>;
    updatePromotion(id: string, data: Partial<{
        isActive: boolean;
        maxUses: number;
        expiresAt: string;
        description: string;
    }>): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        description: string | null;
        code: string;
        value: number;
        minSpend: number | null;
        maxUses: number;
        currentUses: number;
        appliesTo: string;
        isActive: boolean;
        startsAt: Date;
        expiresAt: Date;
    }>;
    getActivityLog(page?: number, limit?: number): Promise<{
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
    logActivity(data: {
        action: string;
        userId?: string;
        userRole?: string;
        target?: string;
        type: string;
        metadata?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        metadata: Prisma.JsonValue | null;
        userId: string | null;
        type: string;
        action: string;
        userRole: string | null;
        target: string | null;
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
    private getPlatformStats;
    getSettings(): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: string[];
            type: string;
            description: string | null;
            label: string;
            key: string;
            value: string;
            category: string;
        }[];
    }>;
    updateSettings(updates: {
        key: string;
        value: string;
    }[]): Promise<{
        updated: number;
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: string[];
            type: string;
            description: string | null;
            label: string;
            key: string;
            value: string;
            category: string;
        }[];
    }>;
    promoteToAdmin(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    approveHost(hostId: string): Promise<{
        user: {
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        businessName: string;
        isApproved: boolean;
    }>;
}
