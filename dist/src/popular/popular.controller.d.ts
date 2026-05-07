import { PopularService } from './popular.service';
export declare class PopularController {
    private popularService;
    constructor(popularService: PopularService);
    accommodations(): Promise<{
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
    buses(): Promise<{
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
    attractions(): Promise<{
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
    packages(): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        image: any;
        images: any;
    }[]>;
    sync(): Promise<{
        message: string;
    }>;
}
