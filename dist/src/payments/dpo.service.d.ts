import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DpoService {
    private config;
    private prisma;
    private notifications;
    private readonly logger;
    private dpoBaseUrl;
    private serviceCode;
    private returnUrl;
    private securityHash;
    constructor(config: ConfigService, prisma: PrismaService, notifications: NotificationsService);
    initiatePayment(amount: number, userId: string, bookingId: string, currency?: string): Promise<{
        transactionId: string;
        checkoutUrl: string;
    }>;
    handleCallback(payload: any): Promise<void>;
    validateTransaction(transactionId: string): Promise<any>;
}
