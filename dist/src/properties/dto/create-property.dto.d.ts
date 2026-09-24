import { PropertyType } from '@prisma/client';
export declare class CreatePropertyDto {
    name: string;
    description: string;
    location: string;
    type: PropertyType;
    currency?: string;
    images?: string[];
    amenities?: string[];
    rules?: string[];
}
