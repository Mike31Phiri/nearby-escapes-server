import { WishlistService } from './wishlist.service';
import type { User } from '@prisma/client';
export declare class WishlistController {
    private wishlistService;
    constructor(wishlistService: WishlistService);
    getWishlist(user: User): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            description: string;
            location: string;
            thumbnailUrl: any;
            price: number;
            priceFormatted: string;
            currency: string;
            reviewCount: number;
            hostName: any;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    addItem(user: User, listingId: string, listingType: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            description: string;
            location: string;
            thumbnailUrl: any;
            price: number;
            priceFormatted: string;
            currency: string;
            reviewCount: number;
            hostName: any;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeItem(user: User, listingId: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            description: string;
            location: string;
            thumbnailUrl: any;
            price: number;
            priceFormatted: string;
            currency: string;
            reviewCount: number;
            hostName: any;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
