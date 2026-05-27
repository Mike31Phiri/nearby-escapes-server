import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateReviewDto): Promise<{
        id: any;
        listingId: any;
        bookingRef: any;
        guestId: any;
        guestName: any;
        rating: any;
        text: any;
        createdAt: any;
    }>;
    findByListing(listingId: string): Promise<{
        id: any;
        listingId: any;
        bookingRef: any;
        guestId: any;
        guestName: any;
        rating: any;
        text: any;
        createdAt: any;
    }[]>;
    findByUser(userId: string): Promise<{
        listingName: any;
        id: any;
        listingId: any;
        bookingRef: any;
        guestId: any;
        guestName: any;
        rating: any;
        text: any;
        createdAt: any;
    }[]>;
    private formatReview;
}
