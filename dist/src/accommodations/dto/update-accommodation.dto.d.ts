import { AccommodationCategory, CancellationPolicy } from '@prisma/client';
export declare class UpdateAccommodationDto {
    name?: string;
    description?: string;
    location?: string;
    pricePerNight?: number;
    totalRooms?: number;
    availableRooms?: number;
    maxGuests?: number;
    amenities?: string[];
    category?: AccommodationCategory;
    cancellationPolicy?: CancellationPolicy;
}
