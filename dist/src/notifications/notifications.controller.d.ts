import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
export declare class NotificationsController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(user: User): Promise<{
        notifications: {
            id: string;
            type: string;
            title: string;
            description: string;
            isRead: boolean;
            createdAt: Date;
            actionUrl: string | null;
        }[];
        unreadCount: number;
    }>;
    markRead(user: User, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        description: string;
        isRead: boolean;
        actionUrl: string | null;
    }>;
    markAllRead(user: User): Promise<{
        message: string;
    }>;
}
