import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import type { User } from '@prisma/client';
export declare class FeedbackController {
    private feedbackService;
    constructor(feedbackService: FeedbackService);
    create(user: User, dto: CreateFeedbackDto): Promise<{
        id: string;
        stayId: string;
        bookingId: string;
        rating: number;
        comment: string | null;
        authorName: string;
        createdAt: Date;
    }>;
    findByStay(id: string): Promise<{
        id: string;
        stayId: string;
        bookingId: string;
        rating: number;
        comment: string | null;
        authorName: string;
        createdAt: Date;
    }[]>;
}
