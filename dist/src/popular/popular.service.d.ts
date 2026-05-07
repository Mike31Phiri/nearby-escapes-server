import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class PopularService {
    private prisma;
    private config;
    private zmwRate;
    constructor(prisma: PrismaService, config: ConfigService);
    getPopularAccommodations(): Promise<{
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
        host: {
            id: any;
            displayName: string;
            avatarUrl: any;
            location: any;
            verified: any;
        } | null;
    }[]>;
    getPopularBuses(): Promise<{
        id: any;
        name: any;
        description: any;
        route: any;
        from: any;
        to: any;
        departureTime: any;
        arrivalTime: any;
        price: number;
        image: any;
        images: any;
    }[]>;
    getPopularAttractions(): Promise<{
        id: any;
        name: any;
        description: any;
        location: any;
        price: number;
        image: any;
        images: any;
        capacity: any;
        availableSlots: any;
    }[]>;
    getPopularPackages(): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        image: any;
        images: any;
    }[]>;
    private toStay;
    private toBus;
    private toAttraction;
    private toPackage;
    syncPopular(): Promise<{
        message: string;
    }>;
    private syncAccommodations;
    private syncBuses;
    private syncAttractions;
    private syncPackages;
}
