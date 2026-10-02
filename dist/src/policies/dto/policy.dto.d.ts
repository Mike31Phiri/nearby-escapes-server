export type PolicyStatus = 'draft' | 'published' | 'archived';
export type PolicyCategory = 'legal' | 'guest_protection' | 'host_standards' | 'safety_security' | 'fee_structure';
export declare enum PolicyTypeEnum {
    TERMS_OF_SERVICE = "TERMS_OF_SERVICE",
    PRIVACY_POLICY = "PRIVACY_POLICY",
    CANCELLATION = "CANCELLATION",
    REFUND_POLICY = "REFUND_POLICY",
    HOST_STANDARDS = "HOST_STANDARDS",
    GUEST_STANDARDS = "GUEST_STANDARDS",
    TRUST_SAFETY = "TRUST_SAFETY",
    OTHER = "OTHER"
}
export declare class CreatePolicyDto {
    slug: string;
    title: string;
    type?: PolicyTypeEnum | string;
    category?: PolicyCategory | string;
    description?: string;
    content?: string;
    contentMarkdown?: string;
    version?: string;
    status?: PolicyStatus | string;
    summary?: string;
    summaryOfChanges?: string;
    documentUrl?: string;
    metadata?: any;
    effectiveDate?: string;
    isPublished?: boolean;
}
export declare class UpdatePolicyDto {
    title?: string;
    type?: PolicyTypeEnum | string;
    category?: PolicyCategory | string;
    description?: string;
    isPublished?: boolean;
    status?: PolicyStatus | string;
    version?: string;
    summaryOfChanges?: string;
    summary?: string;
    contentMarkdown?: string;
    content?: string;
    effectiveDate?: string;
}
export declare class CreatePolicyVersionDto {
    version: string;
    content?: string;
    contentMarkdown?: string;
    summary?: string;
    summaryOfChanges?: string;
    documentUrl?: string;
    metadata?: any;
    effectiveDate?: string;
    setAsCurrent?: boolean;
}
export type CancellationTier = 'flexible' | 'moderate' | 'strict' | 'custom';
export declare class PropertyCancellationPolicyDto {
    tier: CancellationTier;
    customText?: string;
    freeCancellationCutOffHours: number;
    refundPercentagePriorToCutOff: number;
    refundPercentageAfterCutOff: number;
    nonRefundableDiscountAvailable: boolean;
}
export declare class PropertySchedulePolicyDto {
    checkInFrom: string;
    checkInUntil: string;
    checkOutBefore: string;
    selfCheckInAllowed: boolean;
    selfCheckInMethod?: 'smart_lock' | 'keypad' | 'lockbox' | 'front_desk' | 'host_greeter' | string;
}
export declare class PropertyQuietHoursDto {
    enabled: boolean;
    startTime: string;
    endTime: string;
}
export declare class PropertyHouseRulesDto {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    partiesOrEventsAllowed: boolean;
    commercialPhotographyAllowed: boolean;
    quietHours: PropertyQuietHoursDto;
    maxGuests: number;
    minAgeRequirement: number;
    customRules: string[];
}
export declare class PropertySecurityDepositDto {
    required: boolean;
    amountNgwee: number;
    currency: 'ZMW' | 'USD' | string;
    refundTimelineHours: number;
}
export declare class PropertySafetyDevicesDto {
    smokeAlarm: boolean;
    carbonMonoxideAlarm: boolean;
    firstAidKit: boolean;
    fireExtinguisher: boolean;
    securityCamerasOnProperty: boolean;
    cameraLocations?: string;
}
export declare class PropertyGoodToKnowDto {
    customPoliciesText: string;
    safetyDevices: PropertySafetyDevicesDto;
}
export declare class UpdatePropertyPoliciesDto {
    cancellation: PropertyCancellationPolicyDto;
    schedule: PropertySchedulePolicyDto;
    houseRules: PropertyHouseRulesDto;
    securityDeposit: PropertySecurityDepositDto;
    goodToKnow: PropertyGoodToKnowDto;
}
