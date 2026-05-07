import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateFeedbackDto): Promise<{
        id: string;
        stayId: string;
        bookingId: string;
        rating: number;
        comment: string | null;
        authorName: string;
        createdAt: Date;
    }>;
    findByStay(stayId: string): Promise<{
        id: string;
        stayId: string;
        bookingId: string;
        rating: number;
        comment: string | null;
        authorName: string;
        createdAt: Date;
    }[]>;
}
