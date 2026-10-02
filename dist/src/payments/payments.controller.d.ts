import { EskrowService } from './eskrow.service';
import { DpoService } from './dpo.service';
import { CreateTokenDto } from './dto/create-token.dto';
import type { User } from '@prisma/client';
export declare class PaymentsController {
    private eskrowService;
    private dpoService;
    constructor(eskrowService: EskrowService, dpoService: DpoService);
    createToken(user: User, dto: CreateTokenDto): Promise<{
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
    handleWebhook(payload: any, signature?: string): Promise<{
        status: string;
    }>;
    initiateDpoPayment(user: User, dto: CreateTokenDto): Promise<{
        success: boolean;
        transToken: any;
        paymentUrl: string;
        bookingRef: string;
        message: string;
    }>;
    verifyDpoPayment(transToken: string): Promise<any>;
    verifyDpoPaymentGet(transToken: string): Promise<any>;
    handleDpoWebhook(payload: any): Promise<{
        status: string;
    }>;
}
