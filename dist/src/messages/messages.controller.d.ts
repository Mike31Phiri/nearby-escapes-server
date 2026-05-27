import { MessagesService } from './messages.service';
import type { User } from '@prisma/client';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    getConversations(user: User): Promise<{
        id: string;
        participants: {
            id: any;
            name: any;
            avatar: any;
        }[];
        lastMessage: {
            id: string;
            senderId: string;
            senderName: string;
            text: string;
            createdAt: Date;
        } | null;
        unreadCount: number;
        listingId: string | null;
        listingName: null;
        createdAt: Date;
    }[]>;
    getMessages(user: User, id: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            text: string;
            conversationId: string;
            senderId: string;
            read: boolean;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    startConversation(user: User, recipientId: string, initialMessage?: string, listingId?: string, bookingRef?: string): Promise<({
        participants: ({
            user: {
                name: string;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            conversationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bookingRef: string | null;
        listingId: string | null;
    }) | null>;
    sendMessage(user: User, id: string, text: string): Promise<{
        id: string;
        senderId: string;
        text: string;
        createdAt: Date;
        read: boolean;
    }>;
    markAsRead(user: User, id: string): Promise<{
        message: string;
    }>;
}
