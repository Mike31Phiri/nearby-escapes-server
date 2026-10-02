export declare class BlockDatesDto {
    propertyId?: string;
    stayId?: string;
    listingId?: string;
    unitId?: string;
    count?: number;
    dateFrom?: string;
    dateTo?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
}
export declare class BlockDatesResponseDto {
    success: boolean;
    blockedRangeId: string;
    listingId: string;
    startDate: string;
    endDate: string;
    reason?: string;
}
export declare class UnblockDatesDto {
    propertyId?: string;
    listingId?: string;
    startDate: string;
    endDate: string;
    unitId?: string;
    count?: number;
}
export declare class UnblockDatesResponseDto {
    success: boolean;
    message?: string;
}
export declare class ExperienceSlotBlockDto {
    propertyId?: string;
    experienceId?: string;
    date: string;
    slot: string;
}
export declare class ExperienceSlotActionResponseDto {
    success: boolean;
    message: string;
}
export declare class SeasonalPricingDto {
    stayId?: string;
    listingId?: string;
    from: string;
    to: string;
    price: number;
    label?: string;
}
export declare class ExperienceAvailabilityQueryDto {
    date: string;
}
export declare class TransportAvailabilityQueryDto {
    date: string;
}
