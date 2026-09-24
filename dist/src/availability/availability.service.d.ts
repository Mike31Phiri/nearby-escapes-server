import { PrismaService } from '../prisma/prisma.service';
import { BlockDatesDto, SeasonalPricingDto } from './dto/availability.dto';
export declare class AvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    getStayAvailability(stayId: string, year?: number, month?: number): Promise<any[]>;
    getAvailability(stayId: string, year?: number, month?: number): Promise<any[]>;
    getExperienceAvailability(experienceId: string, dateStr: string): Promise<{
        experienceId: string;
        propertyId: string;
        name: string;
        date: string;
        slots: {
            slot: string;
            available: boolean;
            status: string;
            capacity: number;
            bookedSpots: number;
            remainingSpots: number;
            isHeld: boolean;
            holdExpiresAt: string | null;
            price: number;
            priceFormatted: string;
        }[];
    }>;
    getTransportAvailability(transportId: string, dateStr: string): Promise<{
        transportId: string;
        propertyId: string;
        name: string;
        date: string;
        available: boolean;
        capacity: number;
        bookedSeats: number;
        remainingSeats: number;
        pricePerSeat: number | null;
        priceFormatted: string;
        schedule: import("@prisma/client/runtime/client").JsonValue;
    }>;
    blockDates(dto: BlockDatesDto, userId: string): Promise<{
        message: string;
    }>;
    unblockDates(dto: BlockDatesDto, userId: string): Promise<{
        message: string;
    }>;
    addSeasonalPricing(dto: SeasonalPricingDto, userId: string): Promise<{
        id: string;
        stayId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
    removeSeasonalPricing(id: string, userId: string): Promise<{
        id: string;
        stayId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
    private assertStayOwnership;
}
