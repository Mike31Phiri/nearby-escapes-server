import type { Request } from 'express';
import { DpoService } from './dpo.service';
import { PaymentIntentDto } from './dto/payment-intent.dto';
export declare class PaymentsController {
    private dpoService;
    constructor(dpoService: DpoService);
    createIntent(user: any, dto: PaymentIntentDto): Promise<{
        intentId: string;
        checkoutUrl: string;
        status: string;
    }>;
    handleDpoWebhook(req: Request): Promise<{
        status: string;
    }>;
}
