import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';
export declare class PackagesController {
    private packagesService;
    private hostsService;
    constructor(packagesService: PackagesService, hostsService: HostsService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        host: {
            businessName: string;
        };
        items: {
            id: string;
            itemType: import("@prisma/client").$Enums.BookingType;
            accommodationId: string | null;
            busId: string | null;
            attractionId: string | null;
            packageId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        host: {
            businessName: string;
        };
        items: {
            id: string;
            itemType: import("@prisma/client").$Enums.BookingType;
            accommodationId: string | null;
            busId: string | null;
            attractionId: string | null;
            packageId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    }>;
    create(user: User, dto: CreatePackageDto): Promise<{
        items: {
            id: string;
            itemType: import("@prisma/client").$Enums.BookingType;
            accommodationId: string | null;
            busId: string | null;
            attractionId: string | null;
            packageId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    }>;
    update(user: User, id: string, dto: UpdatePackageDto): Promise<{
        items: {
            id: string;
            itemType: import("@prisma/client").$Enums.BookingType;
            accommodationId: string | null;
            busId: string | null;
            attractionId: string | null;
            packageId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(user: User, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    }>;
    myListings(user: User): Promise<({
        items: {
            id: string;
            itemType: import("@prisma/client").$Enums.BookingType;
            accommodationId: string | null;
            busId: string | null;
            attractionId: string | null;
            packageId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
}
