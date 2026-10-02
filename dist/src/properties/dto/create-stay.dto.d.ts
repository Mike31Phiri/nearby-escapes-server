import { CancellationPolicy } from '@prisma/client';
import { CreateListingPolicyDto } from './listing-policy.dto';
export declare class CreateStayDto {
    name: string;
    description?: string;
    price: number;
    roomType?: string;
    bedrooms?: number;
    beds?: number;
    baths?: number;
    maxGuests?: number;
    checkInFrom?: string;
    checkInUntil?: string;
    checkOutBefore?: string;
    cancellationPolicy?: CancellationPolicy;
    isActive?: boolean;
    sortOrder?: number;
    policies?: CreateListingPolicyDto[];
    tags?: any[];
    recommendations?: any[];
}
export declare class UpdateStayDto {
    name?: string;
    description?: string;
    price?: number;
    roomType?: string;
    bedrooms?: number;
    beds?: number;
    baths?: number;
    maxGuests?: number;
    checkInFrom?: string;
    checkInUntil?: string;
    checkOutBefore?: string;
    cancellationPolicy?: CancellationPolicy;
    isActive?: boolean;
    sortOrder?: number;
}
