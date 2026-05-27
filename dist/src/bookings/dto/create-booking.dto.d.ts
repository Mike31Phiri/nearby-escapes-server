export declare class CreateBookingDto {
    listingId: string;
    listingType: string;
    checkIn?: string;
    checkOut?: string;
    date?: string;
    guests: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    specialRequests?: string;
}
export declare class CancelBookingDto {
    reason?: string;
}
