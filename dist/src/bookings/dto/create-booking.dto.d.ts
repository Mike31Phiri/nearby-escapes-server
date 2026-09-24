export declare class CreateBookingDto {
    propertyId?: string;
    listingId?: string;
    stayId?: string;
    experienceId?: string;
    transportId?: string;
    listingType?: string;
    checkIn?: string;
    checkOut?: string;
    date?: string;
    timeSlot?: string;
    guests: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    specialRequests?: string;
}
export declare class CancelBookingDto {
    reason?: string;
}
