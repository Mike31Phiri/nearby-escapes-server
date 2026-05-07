import { InboxService } from './inbox.service';
import type { User } from '@prisma/client';
export declare class InboxController {
    private inboxService;
    constructor(inboxService: InboxService);
    getThreads(user: User): Promise<{
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
    getMessages(user: User, id: string): Promise<{
        id: string;
        createdAt: Date;
        threadId: string;
        senderId: string;
        body: string;
    }[]>;
    sendMessage(user: User, id: string, body: string): Promise<{
        id: string;
        createdAt: Date;
        threadId: string;
        senderId: string;
        body: string;
    }>;
    createThread(user: User, recipientId: string): Promise<{
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
}
