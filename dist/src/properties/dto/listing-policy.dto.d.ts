export declare enum ListingPolicyCategoryEnum {
    CANCELLATION = "CANCELLATION",
    CHECK_IN = "CHECK_IN",
    CHECK_OUT = "CHECK_OUT",
    HOUSE_RULES = "HOUSE_RULES",
    SAFETY = "SAFETY",
    PET_POLICY = "PET_POLICY",
    CHILD_POLICY = "CHILD_POLICY",
    NOISE_POLICY = "NOISE_POLICY",
    SMOKING_POLICY = "SMOKING_POLICY",
    REFUND = "REFUND",
    DAMAGE = "DAMAGE",
    OTHER = "OTHER"
}
export declare class CreateListingPolicyDto {
    category: ListingPolicyCategoryEnum;
    title: string;
    body: string;
    sortOrder?: number;
}
export declare class UpdateListingPolicyDto {
    category?: ListingPolicyCategoryEnum;
    title?: string;
    body?: string;
    sortOrder?: number;
}
export declare class SetListingPoliciesDto {
    policies: CreateListingPolicyDto[];
}
