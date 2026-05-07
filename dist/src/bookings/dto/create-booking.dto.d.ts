export declare class GuestInfoDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialRequests?: string;
}
export declare class CreateBookingDto {
    stayId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestInfo: GuestInfoDto;
}
