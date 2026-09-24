export declare class BlockDatesDto {
    stayId?: string;
    listingId?: string;
    dateFrom: string;
    dateTo: string;
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
