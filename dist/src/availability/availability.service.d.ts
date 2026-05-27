import { PrismaService } from '../prisma/prisma.service';
import { BlockDatesDto, SeasonalPricingDto } from './dto/availability.dto';
export declare class AvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    getAvailability(listingId: string, year?: number, month?: number): Promise<any[]>;
    blockDates(dto: BlockDatesDto, userId: string): Promise<{
        message: string;
    }>;
    unblockDates(dto: BlockDatesDto, userId: string): Promise<{
        message: string;
    }>;
    addSeasonalPricing(dto: SeasonalPricingDto, userId: string): Promise<{
        id: string;
        listingId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
    removeSeasonalPricing(id: string, userId: string): Promise<{
        id: string;
        listingId: string;
        from: Date;
        to: Date;
        price: number;
        label: string | null;
    }>;
    private assertListingOwnership;
}
