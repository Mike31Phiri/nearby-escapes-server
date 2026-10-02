"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePropertyPoliciesDto = exports.PropertyGoodToKnowDto = exports.PropertySafetyDevicesDto = exports.PropertySecurityDepositDto = exports.PropertyHouseRulesDto = exports.PropertyQuietHoursDto = exports.PropertySchedulePolicyDto = exports.PropertyCancellationPolicyDto = exports.CreatePolicyVersionDto = exports.UpdatePolicyDto = exports.CreatePolicyDto = exports.PolicyTypeEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var PolicyTypeEnum;
(function (PolicyTypeEnum) {
    PolicyTypeEnum["TERMS_OF_SERVICE"] = "TERMS_OF_SERVICE";
    PolicyTypeEnum["PRIVACY_POLICY"] = "PRIVACY_POLICY";
    PolicyTypeEnum["CANCELLATION"] = "CANCELLATION";
    PolicyTypeEnum["REFUND_POLICY"] = "REFUND_POLICY";
    PolicyTypeEnum["HOST_STANDARDS"] = "HOST_STANDARDS";
    PolicyTypeEnum["GUEST_STANDARDS"] = "GUEST_STANDARDS";
    PolicyTypeEnum["TRUST_SAFETY"] = "TRUST_SAFETY";
    PolicyTypeEnum["OTHER"] = "OTHER";
})(PolicyTypeEnum || (exports.PolicyTypeEnum = PolicyTypeEnum = {}));
class CreatePolicyDto {
    slug;
    title;
    type;
    category;
    description;
    content;
    contentMarkdown;
    version;
    status;
    summary;
    summaryOfChanges;
    documentUrl;
    metadata;
    effectiveDate;
    isPublished;
}
exports.CreatePolicyDto = CreatePolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL-friendly unique identifier', example: 'guest-refund-policy' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display title of the policy', example: 'Guest Refund & Extenuating Circumstances Policy' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: PolicyTypeEnum, example: PolicyTypeEnum.REFUND_POLICY }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category e.g. guest_protection, legal, host_standards, safety_security, fee_structure' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Short summary or subtitle of policy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full text or markdown content of initial version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Markdown content for policy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "contentMarkdown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Initial version string', example: '2.0.0', default: '1.0.0' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status: draft | published | archived' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Changelog / version summary' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Changelog / summary of changes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "summaryOfChanges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Direct URL to PDF or legal document in S3' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Structured JSON rules/metadata (e.g. refund tiers)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePolicyDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Effective date ISO timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether policy is live/published', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePolicyDto.prototype, "isPublished", void 0);
class UpdatePolicyDto {
    title;
    type;
    category;
    description;
    isPublished;
    status;
    version;
    summaryOfChanges;
    summary;
    contentMarkdown;
    content;
    effectiveDate;
}
exports.UpdatePolicyDto = UpdatePolicyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Display title of the policy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: PolicyTypeEnum }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Short summary or subtitle of policy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether policy is live/published' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePolicyDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status: draft | published | archived' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "summaryOfChanges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "contentMarkdown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "effectiveDate", void 0);
class CreatePolicyVersionDto {
    version;
    content;
    contentMarkdown;
    summary;
    summaryOfChanges;
    documentUrl;
    metadata;
    effectiveDate;
    setAsCurrent;
}
exports.CreatePolicyVersionDto = CreatePolicyVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New version string', example: '1.1.0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full text or markdown content for this version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Markdown content for this version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "contentMarkdown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Change notes for this version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Changelog / summary of changes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "summaryOfChanges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Direct URL to PDF or legal document in S3' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Structured JSON rules/metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePolicyVersionDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Effective date ISO timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Promote this version to currentVersion on the policy', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePolicyVersionDto.prototype, "setAsCurrent", void 0);
class PropertyCancellationPolicyDto {
    tier;
    customText;
    freeCancellationCutOffHours;
    refundPercentagePriorToCutOff;
    refundPercentageAfterCutOff;
    nonRefundableDiscountAvailable;
}
exports.PropertyCancellationPolicyDto = PropertyCancellationPolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['flexible', 'moderate', 'strict', 'custom'], example: 'moderate' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyCancellationPolicyDto.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Full refund up to 5 days before check-in.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyCancellationPolicyDto.prototype, "customText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyCancellationPolicyDto.prototype, "freeCancellationCutOffHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyCancellationPolicyDto.prototype, "refundPercentagePriorToCutOff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyCancellationPolicyDto.prototype, "refundPercentageAfterCutOff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyCancellationPolicyDto.prototype, "nonRefundableDiscountAvailable", void 0);
class PropertySchedulePolicyDto {
    checkInFrom;
    checkInUntil;
    checkOutBefore;
    selfCheckInAllowed;
    selfCheckInMethod;
}
exports.PropertySchedulePolicyDto = PropertySchedulePolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '14:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertySchedulePolicyDto.prototype, "checkInFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '21:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertySchedulePolicyDto.prototype, "checkInUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:30' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertySchedulePolicyDto.prototype, "checkOutBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertySchedulePolicyDto.prototype, "selfCheckInAllowed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'keypad' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertySchedulePolicyDto.prototype, "selfCheckInMethod", void 0);
class PropertyQuietHoursDto {
    enabled;
    startTime;
    endTime;
}
exports.PropertyQuietHoursDto = PropertyQuietHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyQuietHoursDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '22:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyQuietHoursDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '06:30' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyQuietHoursDto.prototype, "endTime", void 0);
class PropertyHouseRulesDto {
    smokingAllowed;
    petsAllowed;
    partiesOrEventsAllowed;
    commercialPhotographyAllowed;
    quietHours;
    maxGuests;
    minAgeRequirement;
    customRules;
}
exports.PropertyHouseRulesDto = PropertyHouseRulesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyHouseRulesDto.prototype, "smokingAllowed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyHouseRulesDto.prototype, "petsAllowed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyHouseRulesDto.prototype, "partiesOrEventsAllowed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyHouseRulesDto.prototype, "commercialPhotographyAllowed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PropertyQuietHoursDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertyQuietHoursDto),
    __metadata("design:type", PropertyQuietHoursDto)
], PropertyHouseRulesDto.prototype, "quietHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyHouseRulesDto.prototype, "maxGuests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 18 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyHouseRulesDto.prototype, "minAgeRequirement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['Extinguish braai fires before bed'] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], PropertyHouseRulesDto.prototype, "customRules", void 0);
class PropertySecurityDepositDto {
    required;
    amountNgwee;
    currency;
    refundTimelineHours;
}
exports.PropertySecurityDepositDto = PropertySecurityDepositDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertySecurityDepositDto.prototype, "required", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertySecurityDepositDto.prototype, "amountNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ZMW' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertySecurityDepositDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 48 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertySecurityDepositDto.prototype, "refundTimelineHours", void 0);
class PropertySafetyDevicesDto {
    smokeAlarm;
    carbonMonoxideAlarm;
    firstAidKit;
    fireExtinguisher;
    securityCamerasOnProperty;
    cameraLocations;
}
exports.PropertySafetyDevicesDto = PropertySafetyDevicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertySafetyDevicesDto.prototype, "smokeAlarm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertySafetyDevicesDto.prototype, "carbonMonoxideAlarm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertySafetyDevicesDto.prototype, "firstAidKit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertySafetyDevicesDto.prototype, "fireExtinguisher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertySafetyDevicesDto.prototype, "securityCamerasOnProperty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Exterior perimeter fence only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertySafetyDevicesDto.prototype, "cameraLocations", void 0);
class PropertyGoodToKnowDto {
    customPoliciesText;
    safetyDevices;
}
exports.PropertyGoodToKnowDto = PropertyGoodToKnowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lodge operates on 24-hour solar inverter.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyGoodToKnowDto.prototype, "customPoliciesText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PropertySafetyDevicesDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertySafetyDevicesDto),
    __metadata("design:type", PropertySafetyDevicesDto)
], PropertyGoodToKnowDto.prototype, "safetyDevices", void 0);
class UpdatePropertyPoliciesDto {
    cancellation;
    schedule;
    houseRules;
    securityDeposit;
    goodToKnow;
}
exports.UpdatePropertyPoliciesDto = UpdatePropertyPoliciesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: PropertyCancellationPolicyDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertyCancellationPolicyDto),
    __metadata("design:type", PropertyCancellationPolicyDto)
], UpdatePropertyPoliciesDto.prototype, "cancellation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PropertySchedulePolicyDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertySchedulePolicyDto),
    __metadata("design:type", PropertySchedulePolicyDto)
], UpdatePropertyPoliciesDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PropertyHouseRulesDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertyHouseRulesDto),
    __metadata("design:type", PropertyHouseRulesDto)
], UpdatePropertyPoliciesDto.prototype, "houseRules", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PropertySecurityDepositDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertySecurityDepositDto),
    __metadata("design:type", PropertySecurityDepositDto)
], UpdatePropertyPoliciesDto.prototype, "securityDeposit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PropertyGoodToKnowDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertyGoodToKnowDto),
    __metadata("design:type", PropertyGoodToKnowDto)
], UpdatePropertyPoliciesDto.prototype, "goodToKnow", void 0);
//# sourceMappingURL=policy.dto.js.map