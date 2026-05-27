import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    getConversations(userId: string): Promise<{
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
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
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
    sendMessage(conversationId: string, userId: string, text: string): Promise<{
        id: string;
        senderId: string;
        text: string;
        createdAt: Date;
        read: boolean;
    }>;
    startConversation(userId: string, recipientId: string, initialMessage?: string, listingId?: string, bookingRef?: string): Promise<({
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
    markAsRead(conversationId: string, userId: string): Promise<{
        message: string;
    }>;
    private assertParticipant;
}
