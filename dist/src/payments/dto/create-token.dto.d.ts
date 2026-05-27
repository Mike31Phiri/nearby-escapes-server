export declare class CustomerDto {
    name: string;
    phone: string;
    email?: string;
}
export declare class ListingDto {
    id: string;
    name: string;
    type: string;
}
export declare class BookingDetailsDto {
    checkIn?: string;
    checkOut?: string;
    date?: string;
    guests: number;
}
export declare class CreateTokenDto {
    bookingRef: string;
    amount: number;
    currency: string;
    customer: CustomerDto;
    listing: ListingDto;
    details: BookingDetailsDto;
    callbackUrl?: string;
}
