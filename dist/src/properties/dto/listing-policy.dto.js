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
exports.SetListingPoliciesDto = exports.UpdateListingPolicyDto = exports.CreateListingPolicyDto = exports.ListingPolicyCategoryEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var ListingPolicyCategoryEnum;
(function (ListingPolicyCategoryEnum) {
    ListingPolicyCategoryEnum["CANCELLATION"] = "CANCELLATION";
    ListingPolicyCategoryEnum["CHECK_IN"] = "CHECK_IN";
    ListingPolicyCategoryEnum["CHECK_OUT"] = "CHECK_OUT";
    ListingPolicyCategoryEnum["HOUSE_RULES"] = "HOUSE_RULES";
    ListingPolicyCategoryEnum["SAFETY"] = "SAFETY";
    ListingPolicyCategoryEnum["PET_POLICY"] = "PET_POLICY";
    ListingPolicyCategoryEnum["CHILD_POLICY"] = "CHILD_POLICY";
    ListingPolicyCategoryEnum["NOISE_POLICY"] = "NOISE_POLICY";
    ListingPolicyCategoryEnum["SMOKING_POLICY"] = "SMOKING_POLICY";
    ListingPolicyCategoryEnum["REFUND"] = "REFUND";
    ListingPolicyCategoryEnum["DAMAGE"] = "DAMAGE";
    ListingPolicyCategoryEnum["OTHER"] = "OTHER";
})(ListingPolicyCategoryEnum || (exports.ListingPolicyCategoryEnum = ListingPolicyCategoryEnum = {}));
class CreateListingPolicyDto {
    category;
    title;
    body;
    sortOrder;
}
exports.CreateListingPolicyDto = CreateListingPolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ListingPolicyCategoryEnum, example: 'HOUSE_RULES' }),
    (0, class_validator_1.IsEnum)(ListingPolicyCategoryEnum),
    __metadata("design:type", String)
], CreateListingPolicyDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'No smoking indoors' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateListingPolicyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Smoking is strictly not permitted inside any of the rooms or chalets.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingPolicyDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingPolicyDto.prototype, "sortOrder", void 0);
class UpdateListingPolicyDto {
    category;
    title;
    body;
    sortOrder;
}
exports.UpdateListingPolicyDto = UpdateListingPolicyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ListingPolicyCategoryEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ListingPolicyCategoryEnum),
    __metadata("design:type", String)
], UpdateListingPolicyDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], UpdateListingPolicyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateListingPolicyDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateListingPolicyDto.prototype, "sortOrder", void 0);
class SetListingPoliciesDto {
    policies;
}
exports.SetListingPoliciesDto = SetListingPoliciesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateListingPolicyDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateListingPolicyDto),
    __metadata("design:type", Array)
], SetListingPoliciesDto.prototype, "policies", void 0);
//# sourceMappingURL=listing-policy.dto.js.map