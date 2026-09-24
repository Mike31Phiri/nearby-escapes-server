import { PropertyStatus } from '@prisma/client';
export declare class UpdatePropertyDto {
    name?: string;
    description?: string;
    location?: string;
    status?: PropertyStatus;
    currency?: string;
}
