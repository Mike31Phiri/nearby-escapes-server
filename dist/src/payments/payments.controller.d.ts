import { DpoService } from './dpo.service';
import { CreateTokenDto } from './dto/create-token.dto';
import type { User } from '@prisma/client';
export declare class PaymentsController {
    private dpoService;
    constructor(dpoService: DpoService);
    createToken(user: User, dto: CreateTokenDto): Promise<{
        success: boolean;
        transToken: any;
        paymentUrl: string;
        bookingRef: string;
        message: string;
    }>;
    verifyPayment(transToken: string): Promise<any>;
    handleWebhook(payload: any): Promise<{
        status: string;
    }>;
}
