import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import type { User } from '@prisma/client';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    findByProperty(propertyId: string): Promise<{
        id: any;
        propertyId: any;
        listingId: any;
        bookingRef: any;
        guestId: any;
        guestName: any;
        rating: any;
        text: any;
        createdAt: any;
    }[]>;
    findByListing(listingId: string): Promise<{
        id: any;
        propertyId: any;
        listingId: any;
        bookingRef: any;
        guestId: any;
        guestName: any;
        rating: any;
        text: any;
        createdAt: any;
    }[]>;
    create(user: User, dto: CreateReviewDto): Promise<{
        id: any;
        propertyId: any;
        listingId: any;
        bookingRef: any;
        guestId: any;
        guestName: any;
        rating: any;
        text: any;
        createdAt: any;
    }>;
    findByUser(user: User): Promise<{
        propertyName: any;
        listingName: any;
        id: any;
        propertyId: any;
        listingId: any;
        bookingRef: any;
        guestId: any;
        guestName: any;
        rating: any;
        text: any;
        createdAt: any;
    }[]>;
}
