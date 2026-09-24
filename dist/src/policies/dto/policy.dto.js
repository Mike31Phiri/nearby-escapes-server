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
exports.CreatePolicyVersionDto = exports.UpdatePolicyDto = exports.CreatePolicyDto = exports.PolicyTypeEnum = void 0;
const class_validator_1 = require("class-validator");
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
    description;
    content;
    version;
    summary;
    documentUrl;
    metadata;
    effectiveDate;
    isPublished;
}
exports.CreatePolicyDto = CreatePolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL-friendly unique identifier', example: 'cancellation-moderate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
    }),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display title of the policy', example: 'Moderate Cancellation Policy' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PolicyTypeEnum, example: PolicyTypeEnum.CANCELLATION }),
    (0, class_validator_1.IsEnum)(PolicyTypeEnum),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Short summary or subtitle of policy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full text or markdown content of initial version' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Initial version string', example: '1.0.0', default: '1.0.0' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Changelog / version summary' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyDto.prototype, "summary", void 0);
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
    description;
    isPublished;
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
    (0, class_validator_1.IsEnum)(PolicyTypeEnum),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "type", void 0);
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
class CreatePolicyVersionDto {
    version;
    content;
    summary;
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
    (0, swagger_1.ApiProperty)({ description: 'Full text or markdown content for this version' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Change notes for this version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePolicyVersionDto.prototype, "summary", void 0);
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
//# sourceMappingURL=policy.dto.js.map