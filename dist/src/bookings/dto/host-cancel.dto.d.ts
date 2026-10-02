export declare class HostCancelReservationDto {
    bookingRef?: string;
    reason?: string;
    cancelledBy?: 'host';
}
export declare class HostCancelReservationResponseDto {
    bookingId: string;
    bookingRef: string;
    status: 'cancelled';
    inventoryReopened: boolean;
    refundAmountNgwee: number;
    penaltyFeeNgwee: number;
    cancellationDate: string;
}
