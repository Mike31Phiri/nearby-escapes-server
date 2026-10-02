export declare class PropertiesQueryDto {
    type?: string;
    vertical?: string;
    location?: string;
    province?: string;
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minPriceNgwee?: number;
    maxPriceNgwee?: number;
    bedrooms?: number;
    amenities?: string;
    page?: number;
    limit?: number;
    sort?: string;
    featured?: string;
    q?: string;
    from?: string;
    to?: string;
    trip?: string;
    passengers?: number;
}
export declare const ListingsQueryDto: typeof PropertiesQueryDto;
