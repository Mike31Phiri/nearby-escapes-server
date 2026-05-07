import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { Prisma } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    initiate(userId: string, dto: InitiatePaymentDto): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            hostAmount: Prisma.Decimal;
            bookingId: string;
            amount: Prisma.Decimal;
            commissionAmount: Prisma.Decimal;
            provider: string | null;
            providerRef: string | null;
            receiptUrl: string | null;
        };
        message: string;
    }>;
}
