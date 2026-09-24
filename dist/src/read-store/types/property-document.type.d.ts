export interface PropertyImageDoc {
    url: string;
    sortOrder: number;
}
export interface PropertyAmenityDoc {
    name: string;
    icon?: string | null;
}
export interface StayUnitDoc {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    priceFormatted: string;
    roomType?: string | null;
    bedrooms?: number | null;
    beds?: number | null;
    baths?: number | null;
    maxGuests?: number | null;
    checkInFrom?: string | null;
    checkInUntil?: string | null;
    checkOutBefore?: string | null;
    cancellationPolicy?: string | null;
    isActive: boolean;
}
export interface ExperienceUnitDoc {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    priceFormatted: string;
    activityType?: string | null;
    duration?: string | null;
    maxParticipants?: number | null;
    difficultyLevel?: string | null;
    meetingPoint?: string | null;
    isActive: boolean;
    timeSlots: string[];
    inclusions: string[];
}
export interface TransportUnitDoc {
    id: string;
    name: string;
    description?: string | null;
    from?: string | null;
    to?: string | null;
    vehicleType?: string | null;
    capacity?: number | null;
    pricePerSeat?: number | null;
    priceFormatted?: string;
    schedule?: any | null;
    isActive: boolean;
}
export interface ReadPropertyDocument {
    id: string;
    type: 'stay' | 'experience' | 'transport';
    status: string;
    name: string;
    description: string;
    location: string;
    currency: string;
    price: number;
    priceFormatted: string;
    rating: number;
    reviewCount: number;
    thumbnailUrl: string | null;
    images: PropertyImageDoc[];
    amenities: PropertyAmenityDoc[];
    rules: string[];
    hostId: string;
    hostName: string | null;
    hostAvatar: string | null;
    stays: StayUnitDoc[];
    experiences: ExperienceUnitDoc[];
    transports: TransportUnitDoc[];
    createdAt: string;
    updatedAt: string;
}
export type ReadListingDocument = ReadPropertyDocument;
export type ListingImageDoc = PropertyImageDoc;
export type ListingAmenityDoc = PropertyAmenityDoc;
export type ListingStayDoc = StayUnitDoc;
export type ListingExperienceDoc = ExperienceUnitDoc;
export type ListingTransportDoc = TransportUnitDoc;
