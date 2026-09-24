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
    type: PolicyTypeEnum;
    description?: string;
    content: string;
    version?: string;
    summary?: string;
    documentUrl?: string;
    metadata?: any;
    effectiveDate?: string;
    isPublished?: boolean;
}
export declare class UpdatePolicyDto {
    title?: string;
    type?: PolicyTypeEnum;
    description?: string;
    isPublished?: boolean;
}
export declare class CreatePolicyVersionDto {
    version: string;
    content: string;
    summary?: string;
    documentUrl?: string;
    metadata?: any;
    effectiveDate?: string;
    setAsCurrent?: boolean;
}
