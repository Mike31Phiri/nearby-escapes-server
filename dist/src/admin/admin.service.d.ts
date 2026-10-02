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
    getProperties(page?: number, limit?: number, status?: string): Promise<{
        data: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            hostName: string | null;
            location: string | null;
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
            location: string | null;
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
    updatePropertyStatus(propertyId: string, status: string, reason?: string): Promise<{
        id: string;
        status: string;
        message: string;
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
            id: string;
            description: string | null;
            guestId: string;
            bookingRef: string;
            hostId: string;
            amount: number;
            guestName: string;
            hostName: string;
            reason: string;
            propertyName: string;
            propertyType: string;
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
        description: string | null;
        guestId: string;
        bookingRef: string;
        hostId: string;
        amount: number;
        guestName: string;
        hostName: string;
        reason: string;
        propertyName: string;
        propertyType: string;
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
        type: string;
        metadata: Prisma.JsonValue | null;
        userId: string | null;
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
            category: string;
            type: string;
            description: string | null;
            options: string[];
            label: string;
            key: string;
            value: string;
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
            category: string;
            type: string;
            description: string | null;
            options: string[];
            label: string;
            key: string;
            value: string;
        }[];
    }>;
    promoteToAdmin(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    approveHost(hostId: string): Promise<{
        id: string;
        email: string;
        resetToken: string | null;
        name: string;
        password: string;
        phone: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
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
        resetTokenExpiry: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    getHostApplications(status?: string, page?: number, limit?: number): Promise<{
        items: ({
            user: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            businessName: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            userId: string;
            operatingSince: string | null;
            province: string | null;
            town: string | null;
            businessEmail: string | null;
            businessPhone: string | null;
            pacraDocs: Prisma.JsonValue | null;
            ownershipDocs: Prisma.JsonValue | null;
            operationDocs: Prisma.JsonValue | null;
            reviewerNotes: string | null;
            reviewedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    reviewHostApplication(applicationId: string, dto: {
        decision: 'approved' | 'rejected';
        notes?: string;
    }): Promise<{
        applicationId: string;
        userId: string;
        status: string;
        decision: "approved" | "rejected";
        reviewedAt: Date | null;
        reviewerNotes: string | null;
        message: string;
    }>;
}
