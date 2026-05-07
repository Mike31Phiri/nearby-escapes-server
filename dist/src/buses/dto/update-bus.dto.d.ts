import { CancellationPolicy } from '@prisma/client';
export declare class UpdateBusDto {
    name?: string;
    description?: string;
    route?: string;
    departureTime?: string;
    arrivalTime?: string;
    pricePerSeat?: number;
    totalSeats?: number;
    availableSeats?: number;
    cancellationPolicy?: CancellationPolicy;
}
