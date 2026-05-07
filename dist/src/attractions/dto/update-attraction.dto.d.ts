import { CancellationPolicy } from '@prisma/client';
export declare class UpdateAttractionDto {
    name?: string;
    description?: string;
    location?: string;
    pricePerPerson?: number;
    capacity?: number;
    availableSlots?: number;
    cancellationPolicy?: CancellationPolicy;
}
