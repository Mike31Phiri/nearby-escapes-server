import { ConfigService } from '@nestjs/config';
import { BookingStatus } from '@prisma/client';
export declare class NotificationsService {
    private config;
    private transporter;
    private readonly logger;
    constructor(config: ConfigService);
    sendBookingPending(to: string, firstName: string, bookingId: string): Promise<void>;
    sendBookingStatusUpdate(to: string, firstName: string, bookingId: string, status: BookingStatus): Promise<void>;
    sendHostApprovalRequest(to: string, hostName: string, bookingId: string, travelerName: string, approveUrl: string, rejectUrl: string): Promise<void>;
    sendCancellationConfirmation(to: string, firstName: string, bookingId: string, refundAmount: number): Promise<void>;
    sendPasswordReset(to: string, firstName: string, resetUrl: string): Promise<void>;
    sendPaymentReceipt(to: string, firstName: string, bookingId: string, amount: number): Promise<void>;
    private send;
}
