export declare class GuestBookingItemDto {
    id: string;
    bookingRef: string;
    listingId: string;
    listingTitle: string;
    listingImage: string;
    location: string;
    vertical: 'stay' | 'experience' | 'transport';
    status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'pending';
    category: 'upcoming' | 'active' | 'recent' | 'cancelled';
    checkInDate: string | null;
    checkOutDate: string | null;
    date: string | null;
    timeSlot: string | null;
    nightsCount?: number;
    stayProgress?: string;
    guestsCount: number;
    totalNgwee: number;
    totalFormatted: string;
    currency: 'ZMW' | 'USD';
    paymentStatus: 'paid' | 'unpaid' | 'refunded';
    hostName: string;
    hostPhone?: string;
    createdAt: string;
}
export declare class GuestBookingsStatsDto {
    totalBookingsCount: number;
    upcomingCount: number;
    activeCount: number;
    recentCount: number;
}
export declare class GuestBookingsGroupedDto {
    upcoming: GuestBookingItemDto[];
    active: GuestBookingItemDto[];
    recent: GuestBookingItemDto[];
    cancelled: GuestBookingItemDto[];
    stats: GuestBookingsStatsDto;
}
export declare class GetGuestBookingsQueryDto {
    category?: 'upcoming' | 'active' | 'recent' | 'cancelled' | 'all';
    userId?: string;
    page?: number;
    limit?: number;
}
