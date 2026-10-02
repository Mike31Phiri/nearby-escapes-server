import { PropertyType, PropertyStatus } from '@prisma/client';
export declare class CreatePropertyDto {
    name: string;
    description?: string;
    location?: string;
    type: PropertyType;
    status?: PropertyStatus;
    isDraft?: boolean;
    draftStep?: number;
    draftData?: any;
    currency?: string;
    images?: string[];
    amenities?: string[];
    rules?: string[];
    tags?: any[];
    recommendations?: any[];
}
