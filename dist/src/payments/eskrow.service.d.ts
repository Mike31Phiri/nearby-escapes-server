import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTokenDto } from './dto/create-token.dto';
import type { User } from '@prisma/client';
export interface EskrowWebhookPayload {
    event: string;
    transactionId: string;
    reference: string;
    status: string;
    amount: number;
    currency: string;
}
export declare class EskrowService {
    private config;
    private prisma;
    private notifications;
    private readonly logger;
    private static readonly BASE_URL_SANDBOX;
    private static readonly BASE_URL_PRODUCTION;
    private static readonly ENDPOINT_INITIATE;
    private static readonly ENDPOINT_VERIFY;
    private static readonly ENDPOINT_RELEASE;
    private static readonly ENDPOINT_STATUS;
    private readonly apiClient;
    private readonly webhookSecret;
    private readonly appUrl;
    constructor(config: ConfigService, prisma: PrismaService, notifications: NotificationsService);
    createPaymentToken(user: User, dto: CreateTokenDto): Promise<{
        success: boolean;
        transactionId: string;
        paymentUrl: string;
        bookingRef: string;
        message: string;
    }>;
    verifyPayment(transactionId: string): Promise<{
        success: boolean;
        transactionId: string;
        status: "PENDING" | "REFUNDED" | "FAILED" | "SUCCESSFUL";
        bookingRef: string | null;
    }>;
    handleWebhook(payload: EskrowWebhookPayload, signature?: string): Promise<void>;
    releaseEscrowFunds(bookingRef: string): Promise<void>;
    private _confirmPayment;
}
