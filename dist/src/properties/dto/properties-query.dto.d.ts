export declare class PropertiesQueryDto {
    type?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
    featured?: string;
    q?: string;
}
export declare const ListingsQueryDto: typeof PropertiesQueryDto;
