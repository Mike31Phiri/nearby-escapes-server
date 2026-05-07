import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';
export declare class AttractionsService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    create(hostId: string, dto: CreateAttractionDto): Promise<{
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
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        host: {
            businessName: string;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        host: {
            businessName: string;
        };
    } & {
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
    }>;
    update(id: string, hostId: string, dto: UpdateAttractionDto): Promise<{
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
    }>;
    remove(id: string, hostId: string): Promise<{
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
    }>;
    findByHost(hostId: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    private assertOwnership;
}
