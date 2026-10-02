import { CreateListingPolicyDto } from './listing-policy.dto';
export declare class CreateExperienceDto {
    name: string;
    description?: string;
    price: number;
    activityType?: string;
    duration?: string;
    maxParticipants?: number;
    difficultyLevel?: string;
    meetingPoint?: string;
    timeSlots?: string[];
    inclusions?: string[];
    isActive?: boolean;
    sortOrder?: number;
    policies?: CreateListingPolicyDto[];
    tags?: any[];
    recommendations?: any[];
}
export declare class UpdateExperienceDto {
    name?: string;
    description?: string;
    price?: number;
    activityType?: string;
    duration?: string;
    maxParticipants?: number;
    difficultyLevel?: string;
    meetingPoint?: string;
    timeSlots?: string[];
    inclusions?: string[];
    isActive?: boolean;
    sortOrder?: number;
}
