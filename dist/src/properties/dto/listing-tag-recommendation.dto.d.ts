export declare enum TagCategoryEnum {
    CATEGORY = "CATEGORY",
    AMENITY = "AMENITY",
    ACTIVITY = "ACTIVITY",
    LOCATION = "LOCATION",
    TRIP_TYPE = "TRIP_TYPE",
    VEHICLE_TYPE = "VEHICLE_TYPE",
    OTHER = "OTHER"
}
export declare enum RecommendationAudienceEnum {
    COUPLES = "COUPLES",
    FAMILIES = "FAMILIES",
    SOLO = "SOLO",
    ADVENTURE = "ADVENTURE",
    NATURE = "NATURE",
    WEEKEND_GETAWAY = "WEEKEND_GETAWAY",
    BUDGET = "BUDGET",
    LUXURY = "LUXURY",
    GENERAL = "GENERAL"
}
export declare class CreateListingTagDto {
    name: string;
    category?: TagCategoryEnum;
    icon?: string;
}
export declare class SetListingTagsDto {
    tags: (string | CreateListingTagDto)[];
}
export declare class CreateListingRecommendationDto {
    audience?: RecommendationAudienceEnum;
    title: string;
    reason?: string;
    badge?: string;
    sortOrder?: number;
}
export declare class SetListingRecommendationsDto {
    recommendations: CreateListingRecommendationDto[];
}
export declare class ListingFilterQueryDto {
    category?: string;
    tag?: string;
    activity?: string;
    amenity?: string;
    location?: string;
    tripType?: string;
    vehicleType?: string;
    recommendation?: string;
}
