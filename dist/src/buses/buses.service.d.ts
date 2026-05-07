import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../uploads/s3.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
export declare class BusesService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    create(hostId: string, dto: CreateBusDto): Promise<{
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
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        host: {
            businessName: string;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        host: {
            businessName: string;
        };
    } & {
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
    }>;
    update(id: string, hostId: string, dto: UpdateBusDto): Promise<{
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
    }>;
    remove(id: string, hostId: string): Promise<{
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
    }>;
    findByHost(hostId: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    private assertOwnership;
}
