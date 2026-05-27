import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private config;
    private prisma?;
    private transporter;
    private readonly logger;
    constructor(config: ConfigService, prisma?: PrismaService | undefined);
    private createNotification;
    sendBookingPending(to: string, name: string, bookingRef: string): Promise<void>;
    sendBookingStatusUpdate(to: string, name: string, bookingRef: string, status: string): Promise<void>;
    sendHostBookingRequest(to: string, hostName: string, bookingRef: string, travelerName: string): Promise<void>;
    sendCancellationConfirmation(to: string, name: string, bookingRef: string, refundAmount: number): Promise<void>;
    sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void>;
    sendPaymentReceipt(to: string, name: string, bookingRef: string, amount: number): Promise<void>;
    private send;
}
