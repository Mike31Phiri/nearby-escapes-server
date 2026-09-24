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
