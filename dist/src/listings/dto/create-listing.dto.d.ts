import { CancellationPolicy } from '@prisma/client';
export declare class ListingsQueryDto {
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
    minDuration?: string;
}
export declare class CreateStayDto {
    name: string;
    description: string;
    propertyType: string;
    bedrooms: number;
    beds: number;
    baths: number;
    maxGuests: number;
    location: string;
    amenities?: string[];
    images?: string[];
    pricePerNight: number;
    checkInFrom?: string;
    checkInUntil?: string;
    checkOutBefore?: string;
    houseRules?: string[];
    cancellationPolicy?: CancellationPolicy;
}
export declare class CreateExperienceDto {
    name: string;
    description: string;
    activityType: string;
    duration: string;
    maxParticipants: number;
    difficultyLevel?: string;
    whatsIncluded?: string[];
    meetingPoint: string;
    timeSlots?: string[];
    images?: string[];
    pricePerPerson: number;
    location: string;
}
export declare class CreateTransportDto {
    name: string;
    description: string;
    from: string;
    to: string;
    vehicleType: string;
    capacity: number;
    pricePerSeat: number;
    schedule?: {
        frequency: string;
        departureTimes: string[];
    };
    images?: string[];
}
export declare class UpdateListingDto {
    name?: string;
    description?: string;
    location?: string;
    images?: string[];
    price?: number;
    status?: string;
}
export declare class AddImagesDto {
    images: string[];
}
export declare class RemoveImageDto {
    imageUrl: string;
}
export declare class CuratedQueryDto {
    type?: string;
}
