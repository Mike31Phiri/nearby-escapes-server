import { AvailabilityService } from './availability.service';
import { BlockDatesDto, SeasonalPricingDto, ExperienceAvailabilityQueryDto, TransportAvailabilityQueryDto } from './dto/availability.dto';
import type { User } from '@prisma/client';
export declare class AvailabilityController {
    private availabilityService;
    constructor(availabilityService: AvailabilityService);
    getStayAvailability(stayId: string, year?: string, month?: string): Promise<any[]>;
    getExperienceAvailability(experienceId: string, query: ExperienceAvailabilityQueryDto): Promise<{
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
    getTransportAvailability(transportId: string, query: TransportAvailabilityQueryDto): Promise<{
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
    getAvailability(listingId: string, year?: string, month?: string): Promise<any[]>;
    blockDates(user: User, dto: BlockDatesDto): Promise<{
        message: string;
    }>;
    unblockDates(user: User, dto: BlockDatesDto): Promise<{
        message: string;
    }>;
    addSeasonalPricing(user: User, dto: SeasonalPricingDto): Promise<{
        id: string;
        stayId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
    removeSeasonalPricing(user: User, id: string): Promise<{
        id: string;
        stayId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
}
