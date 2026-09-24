export declare class CreateTransportDto {
    name: string;
    description?: string;
    from?: string;
    to?: string;
    vehicleType?: string;
    capacity?: number;
    pricePerSeat?: number;
    schedule?: any;
    isActive?: boolean;
    sortOrder?: number;
}
export declare class UpdateTransportDto {
    name?: string;
    description?: string;
    from?: string;
    to?: string;
    vehicleType?: string;
    capacity?: number;
    pricePerSeat?: number;
    schedule?: any;
    isActive?: boolean;
    sortOrder?: number;
}
