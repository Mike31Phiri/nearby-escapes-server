import { AttractionsService } from './attractions.service';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';
export declare class AttractionsController {
    private attractionsService;
    private hostsService;
    constructor(attractionsService: AttractionsService, hostsService: HostsService);
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
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        pricePerPerson: import("@prisma/client-runtime-utils").Decimal;
        capacity: number;
        availableSlots: number;
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
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        pricePerPerson: import("@prisma/client-runtime-utils").Decimal;
        capacity: number;
        availableSlots: number;
    }>;
    create(user: User, dto: CreateAttractionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        pricePerPerson: import("@prisma/client-runtime-utils").Decimal;
        capacity: number;
        availableSlots: number;
    }>;
    update(user: User, id: string, dto: UpdateAttractionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        pricePerPerson: import("@prisma/client-runtime-utils").Decimal;
        capacity: number;
        availableSlots: number;
    }>;
    remove(user: User, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        pricePerPerson: import("@prisma/client-runtime-utils").Decimal;
        capacity: number;
        availableSlots: number;
    }>;
    myListings(user: User): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy;
        pricePerPerson: import("@prisma/client-runtime-utils").Decimal;
        capacity: number;
        availableSlots: number;
    }[]>;
}
