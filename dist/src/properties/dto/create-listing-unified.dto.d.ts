export declare class StayUnitItemDto {
    id?: string;
    name: string;
    type: string;
    maxGuests: number;
}
export declare class StayDetailsDto {
    propertyType: string;
    inventoryCount?: number;
    bedrooms?: number;
    beds?: number;
    baths?: number;
    maxGuests?: number;
    checkInFrom?: string;
    checkInUntil?: string;
    checkOutBefore?: string;
    guestFavourites?: string[];
    standoutAmenities?: string[];
    safetyAmenities?: string[];
    units?: StayUnitItemDto[];
}
export declare class ExperienceTimeSlotItemDto {
    id?: string;
    label?: string;
    timeSlot: string;
    capacity: number;
}
export declare class ExperienceDetailsDto {
    activityType: string;
    durationMinutes?: number;
    maxParticipants?: number;
    difficulty?: 'easy' | 'moderate' | 'challenging';
    whatsIncluded: string[];
    whatToBring?: string[];
    whatNotToBring?: string[];
    meetingPoint?: string;
    timeSlots?: ExperienceTimeSlotItemDto[];
}
export declare class TransportFleetUnitItemDto {
    id?: string;
    label: string;
    plateNumber?: string;
    seats: number;
}
export declare class TransportDetailsDto {
    vehicleType: string;
    seatingCapacity?: number;
    pickupLocation?: string;
    dropoffLocation?: string;
    includesDriver?: boolean;
    features?: string[];
    whatToBring?: string[];
    guidelines?: string[];
    fleetUnits?: TransportFleetUnitItemDto[];
}
export declare class CreateUnifiedListingDto {
    vertical: 'stay' | 'experience' | 'transport';
    inventoryCount?: number;
    title: string;
    description: string;
    city: string;
    province: string;
    address: string;
    latitude?: number;
    longitude?: number;
    pricePerUnitNgwee: number;
    currency: 'ZMW' | 'USD';
    images: string[];
    amenities: string[];
    houseRules: string[];
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
    stayDetails?: StayDetailsDto;
    experienceDetails?: ExperienceDetailsDto;
    transportDetails?: TransportDetailsDto;
}
export declare class CreateUnifiedListingResponseDto {
    id: string;
    vertical: 'stay' | 'experience' | 'transport';
    title: string;
    slug: string;
    status: 'active' | 'draft';
    pricePerUnitNgwee: number;
    currency: 'ZMW';
    createdAt: string;
}
export declare class UpdateListingStatusDto {
    status: 'active' | 'draft' | 'paused' | 'archived' | 'inactive';
}
export declare class UpdateListingStatusResponseDto {
    id: string;
    status: 'active' | 'draft' | 'paused' | 'archived' | 'inactive';
    updatedAt: string;
}
export declare class DeleteListingResponseDto {
    success: boolean;
}
export declare class AdjustInventoryDto {
    inventoryCount?: number;
    operation?: 'increase' | 'decrease' | 'set';
    amount?: number;
}
export declare class AdjustInventoryResponseDto {
    id: string;
    propertyName: string;
    inventoryCount: number;
    activeUnitsCount: number;
    updatedAt: string;
}
