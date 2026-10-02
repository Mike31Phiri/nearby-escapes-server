export declare class HostScheduleItemDTO {
    id: string;
    type: 'arriving' | 'hosting' | 'departing';
    listingType: 'stay' | 'experience' | 'transport';
    bookingRef: string;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    guestAvatar?: string;
    listingId: string;
    listingName: string;
    listingImage: string;
    checkInDate: string;
    checkOutDate?: string;
    timeSlot?: string;
    stayProgress?: string;
    guestCount: number;
    totalAmountNgwee: number;
    currency: 'ZMW' | 'USD';
    status: 'confirmed' | 'checked_in' | 'checked_out';
}
export declare class HostScheduleTodayDto {
    arriving: HostScheduleItemDTO[];
    hosting: HostScheduleItemDTO[];
    departing: HostScheduleItemDTO[];
}
export declare class HostCheckInResponseDto {
    bookingRef: string;
    status: 'checked_in';
    checkInTimestamp: string;
}
export declare class HostCheckOutResponseDto {
    bookingRef: string;
    status: 'checked_out';
    checkOutTimestamp: string;
}
