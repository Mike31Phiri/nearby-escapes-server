import { CancellationPolicy } from '@prisma/client';
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
