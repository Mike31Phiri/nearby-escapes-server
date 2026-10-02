import { PropertyStatus } from '@prisma/client';
export declare class UpdatePropertyDto {
    name?: string;
    description?: string;
    location?: string;
    status?: PropertyStatus;
    isDraft?: boolean;
    draftStep?: number;
    draftData?: any;
    currency?: string;
    images?: string[];
    amenities?: string[];
    rules?: string[];
    tags?: any[];
    recommendations?: any[];
}
export declare class UpdatePropertyPricingDto {
    pricePerUnitNgwee: number;
    currency?: 'ZMW' | 'USD';
}
export declare class UpdatePropertyPricingResponseDto {
    propertyId: string;
    propertyName: string;
    pricePerUnitNgwee: number;
    currency: string;
    historicalBookingsPreserved: boolean;
    updatedAt: string;
}
