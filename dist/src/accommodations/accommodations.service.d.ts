import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto';
export declare class AccommodationsService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    create(hostId: string, dto: CreateAccommodationDto): Promise<{
        name: string;
        description: string;
        location: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        id: string;
        photos: string[];
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        host: {
            businessName: string;
        };
    } & {
        name: string;
        description: string;
        location: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        id: string;
        photos: string[];
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
    })[]>;
    findOne(id: string): Promise<{
        host: {
            businessName: string;
        };
    } & {
        name: string;
        description: string;
        location: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        id: string;
        photos: string[];
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
    }>;
    update(id: string, hostId: string, dto: UpdateAccommodationDto): Promise<{
        name: string;
        description: string;
        location: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        id: string;
        photos: string[];
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
    }>;
    remove(id: string, hostId: string): Promise<{
        name: string;
        description: string;
        location: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        id: string;
        photos: string[];
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
    }>;
    findByHost(hostId: string): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        description: string;
        location: string;
        pricePerNight: import("@prisma/client-runtime-utils").Decimal;
        totalRooms: number;
        availableRooms: number;
        maxGuests: number;
        amenities: string[];
        category: import("@prisma/client").$Enums.AccommodationCategory;
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        id: string;
        photos: string[];
        createdAt: Date;
        updatedAt: Date;
        hostId: string;
    }[]>;
    private assertOwnership;
}
