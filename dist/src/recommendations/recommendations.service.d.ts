import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class RecommendationsService {
    private prisma;
    private config;
    private zmwRate;
    constructor(prisma: PrismaService, config: ConfigService);
    getRecommendations(userId: string, locationOverride?: string): Promise<{
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
    private toStay;
}
