import { RecommendationsService } from './recommendations.service';
export declare class RecommendationsController {
    private recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getRecommendations(user: any, location?: string): Promise<{
        id: any;
        name: any;
        location: any;
        price: number;
        priceZmw: number;
        rating: number;
        reviews: number;
        image: any;
        images: any;
        category: any;
        description: any;
        amenities: any;
        maxGuests: any;
        availableRooms: any;
        cancellationPolicy: any;
        host: {
            id: any;
            displayName: string;
            avatarUrl: any;
            location: any;
            verified: any;
        } | null;
    }[]>;
}
