import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private readonly config;
    private readonly prisma;
    private transporter;
    private readonly logger;
    constructor(config: ConfigService, prisma: PrismaService);
    push(userId: string, type: NotificationType, title: string, description: string, opts?: {
        actionUrl?: string;
        actionLabel?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        title: string;
        type: import("@prisma/client").$Enums.NotificationType;
        description: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        actionUrl: string | null;
        actionLabel: string | null;
        userId: string;
    } | undefined>;
    getUserNotifications(userId: string, query: {
        page?: number;
        limit?: number;
        type?: string;
        unreadOnly?: boolean;
    }): Promise<{
        success: boolean;
        meta: {
            total: number;
            unreadCount: number;
            page: number;
            limit: number;
            hasMore: boolean;
        };
        data: {
            id: any;
            userId: string;
            type: any;
            title: any;
            description: any;
            timestamp: any;
            read: any;
            actionUrl: any;
            actionLabel: any;
            metadata: any;
        }[];
    }>;
    getUnreadCount(userId: string): Promise<{
        success: boolean;
        unreadCount: number;
    }>;
    markAsRead(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            read: boolean;
            unreadCount: number;
        };
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            markedCount: number;
            unreadCount: number;
        };
    }>;
    deleteNotification(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            deletedId: string;
        };
    }>;
    private serialize;
    onBookingCreated(opts: {
        guestUserId: string;
        guestEmail: string;
        guestName: string;
        hostUserId: string;
        hostEmail: string;
        hostName: string;
        bookingRef: string;
        listingId: string;
        listingName: string;
        checkIn: string;
        checkOut: string;
        guests: number;
        amountZMW: number;
    }): Promise<void>;
    onBookingConfirmed(opts: {
        guestUserId: string;
        guestEmail: string;
        guestName: string;
        hostUserId: string;
        hostEmail: string;
        hostName: string;
        bookingRef: string;
        listingId: string;
        listingName: string;
        checkIn: string;
        checkOut: string;
        guests: number;
        amountZMW: number;
    }): Promise<void>;
    onBookingCancelled(opts: {
        guestUserId: string;
        guestEmail: string;
        guestName: string;
        hostUserId: string;
        hostEmail: string;
        hostName: string;
        bookingRef: string;
        listingId: string;
        listingName: string;
        refundAmountNgwee: number;
        cancelledBy: 'guest' | 'host' | 'admin';
    }): Promise<void>;
    onPayoutCleared(opts: {
        hostUserId: string;
        hostEmail: string;
        hostName: string;
        bookingRef: string;
        payoutRef: string;
        amountZMW: number;
        method: string;
    }): Promise<void>;
    onReviewReceived(opts: {
        hostUserId: string;
        hostEmail: string;
        hostName: string;
        listingId: string;
        listingSlug: string;
        rating: number;
        reviewText: string;
        guestName: string;
    }): Promise<void>;
    onListingStatusChanged(opts: {
        hostUserId: string;
        hostEmail: string;
        hostName: string;
        listingId: string;
        listingName: string;
        approved: boolean;
        reason?: string;
    }): Promise<void>;
    sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void>;
    sendBookingPending(to: string, name: string, bookingRef: string): Promise<void>;
    sendBookingStatusUpdate(to: string, name: string, bookingRef: string, status: string): Promise<void>;
    sendHostBookingRequest(to: string, hostName: string, bookingRef: string, travelerName: string): Promise<void>;
    sendCancellationConfirmation(to: string, name: string, bookingRef: string, refundAmount: number): Promise<void>;
    sendPaymentReceipt(to: string, name: string, bookingRef: string, amount: number): Promise<void>;
    private frontendUrl;
    private tpl;
    private send;
}
