export declare class GetHostBookingsQueryDto {
    status?: 'confirmed' | 'cancelled' | 'completed';
    listingId?: string;
    page?: number;
    limit?: number;
}
export declare class HostBookingListItemDto {
    id: string;
    bookingRef: string;
    listingId: string;
    listingTitle: string;
    vertical: 'stay' | 'experience' | 'transport';
    status: 'confirmed' | 'cancelled' | 'completed';
    checkIn: string | null;
    checkOut: string | null;
    date: string | null;
    guests: number;
    totalNgwee: number;
    guestName: string;
    guestPhone: string;
    createdAt: string;
}
