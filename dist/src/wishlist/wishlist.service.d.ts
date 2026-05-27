import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private prisma;
    constructor(prisma: PrismaService);
    getWishlist(userId: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            type: string;
            name: string;
            description: string;
            location: string;
            images: string[];
            price: number;
            currency: string;
            rating: number;
            reviewCount: number;
            hostName: string | null;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    addItem(userId: string, listingId: string, listingType: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            type: string;
            name: string;
            description: string;
            location: string;
            images: string[];
            price: number;
            currency: string;
            rating: number;
            reviewCount: number;
            hostName: string | null;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeItem(userId: string, listingId: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            type: string;
            name: string;
            description: string;
            location: string;
            images: string[];
            price: number;
            currency: string;
            rating: number;
            reviewCount: number;
            hostName: string | null;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
