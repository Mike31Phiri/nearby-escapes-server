import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    create(hostId: string, dto: CreatePackageDto): Promise<{
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
    update(id: string, hostId: string, dto: UpdatePackageDto): Promise<{
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
    remove(id: string, hostId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        hostId: string;
        photos: string[];
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
    }>;
    findByHost(hostId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    private assertOwnership;
}
