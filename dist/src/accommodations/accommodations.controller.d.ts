import { AccommodationsService } from './accommodations.service';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';
export declare class AccommodationsController {
    private accommodationsService;
    private hostsService;
    constructor(accommodationsService: AccommodationsService, hostsService: HostsService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        host: {
            businessName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
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
    })[]>;
    findOne(id: string): Promise<{
        host: {
            businessName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
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
    }>;
    create(user: User, dto: CreateAccommodationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
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
    }>;
    update(user: User, id: string, dto: UpdateAccommodationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
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
    }>;
    remove(user: User, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
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
    }>;
    myListings(user: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
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
    }[]>;
}
