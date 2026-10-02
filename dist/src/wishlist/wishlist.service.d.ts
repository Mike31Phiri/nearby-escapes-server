import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private prisma;
    constructor(prisma: PrismaService);
    getWishlist(userId: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            description: string | null;
            location: string | null;
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
    addItem(userId: string, propertyId: string, _type?: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            description: string | null;
            location: string | null;
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
    removeItem(userId: string, propertyId: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            propertyId: string;
            listingId: string;
            type: string;
            name: string;
            description: string | null;
            location: string | null;
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
    getSavedListings(userId: string, page?: number, limit?: number): Promise<{
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
    toggleSavedListing(userId: string, listingId: string): Promise<{
        saved: boolean;
        listingId: string;
        totalSaved: number;
    }>;
    removeSavedListing(userId: string, listingId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
