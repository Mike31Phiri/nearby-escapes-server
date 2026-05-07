import { PrismaService } from '../prisma/prisma.service';
export declare class InboxService {
    private prisma;
    constructor(prisma: PrismaService);
    getThreads(userId: string): Promise<{
        id: string;
        participants: string[];
        lastMessage: {
            id: string;
            createdAt: Date;
            threadId: string;
            senderId: string;
            body: string;
        };
        unreadCount: number;
    }[]>;
    getMessages(threadId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        threadId: string;
        senderId: string;
        body: string;
    }[]>;
    sendMessage(threadId: string, userId: string, body: string): Promise<{
        id: string;
        createdAt: Date;
        threadId: string;
        senderId: string;
        body: string;
    }>;
    createThread(userId: string, recipientId: string): Promise<{
        participants: {
            id: string;
            userId: string;
            threadId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private assertParticipant;
}
