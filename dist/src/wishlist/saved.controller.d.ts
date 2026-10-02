import { WishlistService } from './wishlist.service';
import type { User } from '@prisma/client';
export declare class SavedController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getSaved(user: User, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            listingId: string;
            vertical: string;
            title: string;
            city: string | null;
            province: string | null;
            featuredImage: string | null;
            pricePerUnitNgwee: number;
            currency: string;
            rating: number;
            reviewCount: number;
            savedAt: string;
        }[];
        total: number;
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    toggleSaved(user: User, listingId: string): Promise<{
        saved: boolean;
        listingId: string;
        totalSaved: number;
    }>;
    removeSaved(user: User, listingId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
