import { AccommodationCategory } from '@prisma/client';
export declare class CreateAccommodationDto {
    name: string;
    description: string;
    location: string;
    pricePerNight: number;
    totalRooms: number;
    maxGuests?: number;
    amenities?: string[];
    category?: AccommodationCategory;
}
