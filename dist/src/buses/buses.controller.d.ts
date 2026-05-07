import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';
export declare class BusesController {
    private busesService;
    private hostsService;
    constructor(busesService: BusesService, hostsService: HostsService);
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
    create(user: User, dto: CreateBusDto): Promise<{
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
    update(user: User, id: string, dto: UpdateBusDto): Promise<{
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
    remove(user: User, id: string): Promise<{
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
    myListings(user: User): Promise<{
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
}
