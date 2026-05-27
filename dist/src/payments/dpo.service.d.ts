import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTokenDto } from './dto/create-token.dto';
import type { User } from '@prisma/client';
export declare class DpoService {
    private config;
    private prisma;
    private notifications;
    private readonly logger;
    private readonly dpoApiUrl;
    private readonly companyToken;
    private readonly serviceTypeId;
    constructor(config: ConfigService, prisma: PrismaService, notifications: NotificationsService);
    createPaymentToken(user: User, dto: CreateTokenDto): Promise<{
        success: boolean;
        transToken: any;
        paymentUrl: string;
        bookingRef: string;
        message: string;
    }>;
    verifyPayment(transToken: string): Promise<any>;
    handleCallback(payload: any): Promise<void>;
}
