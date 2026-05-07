import { BookingType } from '@prisma/client';
export declare class BookingItemDto {
    itemType: BookingType;
    accommodationId?: string;
    busId?: string;
    attractionId?: string;
    packageId?: string;
    quantity: number;
}
