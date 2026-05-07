import { BookingType } from '@prisma/client';
export declare class PackageItemDto {
    itemType: BookingType;
    accommodationId?: string;
    busId?: string;
    attractionId?: string;
}
