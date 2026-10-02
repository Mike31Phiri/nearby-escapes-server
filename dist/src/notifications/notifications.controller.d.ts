import { NotificationsService } from './notifications.service';
import type { User } from '@prisma/client';
export declare class NotificationsController {
    private readonly notifService;
    constructor(notifService: NotificationsService);
    getNotifications(user: User, page?: string, limit?: string, type?: string, unreadOnly?: string): Promise<{
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
    getUnreadCount(user: User): Promise<{
        success: boolean;
        unreadCount: number;
    }>;
    markRead(user: User, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            read: boolean;
            unreadCount: number;
        };
    }>;
    markAllReadPost(user: User): Promise<{
        success: boolean;
        message: string;
        data: {
            markedCount: number;
            unreadCount: number;
        };
    }>;
    markAllReadPatch(user: User): Promise<{
        success: boolean;
        message: string;
        data: {
            markedCount: number;
            unreadCount: number;
        };
    }>;
    dismiss(user: User, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            deletedId: string;
        };
    }>;
}
