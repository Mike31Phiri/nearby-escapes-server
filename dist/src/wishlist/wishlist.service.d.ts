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
    addItem(userId: string, propertyId: string, _type?: string): Promise<{
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
    removeItem(userId: string, propertyId: string): Promise<{
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
