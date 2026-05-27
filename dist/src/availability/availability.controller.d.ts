import { AvailabilityService } from './availability.service';
import { BlockDatesDto, SeasonalPricingDto } from './dto/availability.dto';
import type { User } from '@prisma/client';
export declare class AvailabilityController {
    private availabilityService;
    constructor(availabilityService: AvailabilityService);
    getAvailability(listingId: string, year?: string, month?: string): Promise<any[]>;
    blockDates(user: User, dto: BlockDatesDto): Promise<{
        message: string;
    }>;
    unblockDates(user: User, dto: BlockDatesDto): Promise<{
        message: string;
    }>;
    addSeasonalPricing(user: User, dto: SeasonalPricingDto): Promise<{
        id: string;
        listingId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
    removeSeasonalPricing(user: User, id: string): Promise<{
        id: string;
        listingId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
}
