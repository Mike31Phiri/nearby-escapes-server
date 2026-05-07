import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
export declare class UploadsService {
    private prisma;
    private config;
    s3: S3Client;
    bucket: string;
    constructor(prisma: PrismaService, config: ConfigService);
    attachPhotos(resourceType: 'accommodation' | 'bus' | 'attraction' | 'package', resourceId: string, urls: string[]): Promise<{
        id: string;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
    } | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        route: string;
        departureTime: Date;
        arrivalTime: Date;
        pricePerSeat: import("@prisma/client-runtime-utils").Decimal;
        totalSeats: number;
        availableSeats: number;
    } | {
        id: string;
        location: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        pricePerPerson: import("@prisma/client-runtime-utils").Decimal;
        capacity: number;
        availableSlots: number;
    } | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deletePhoto(key: string): Promise<{
        deleted: string;
    }>;
}
