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
exports.UpdatePropertyPricingResponseDto = exports.UpdatePropertyPricingDto = exports.UpdatePropertyDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class UpdatePropertyDto {
    name;
    description;
    location;
    status;
    isDraft;
    draftStep;
    draftData;
    currency;
    images;
    amenities;
    rules;
    tags;
    recommendations;
}
exports.UpdatePropertyDto = UpdatePropertyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PropertyStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PropertyStatus),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mark whether this listing is a draft' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePropertyDto.prototype, "isDraft", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wizard step saved at' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdatePropertyDto.prototype, "draftStep", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'JSON draft data' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePropertyDto.prototype, "draftData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "rules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdatePropertyDto.prototype, "recommendations", void 0);
class UpdatePropertyPricingDto {
    pricePerUnitNgwee;
    currency;
}
exports.UpdatePropertyPricingDto = UpdatePropertyPricingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New price per unit in Ngwee (e.g. 4500000 = ZMW 4,500.00)', example: 4500000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePropertyPricingDto.prototype, "pricePerUnitNgwee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['ZMW', 'USD'], example: 'ZMW' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePropertyPricingDto.prototype, "currency", void 0);
class UpdatePropertyPricingResponseDto {
    propertyId;
    propertyName;
    pricePerUnitNgwee;
    currency;
    historicalBookingsPreserved;
    updatedAt;
}
exports.UpdatePropertyPricingResponseDto = UpdatePropertyPricingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-prop-1' }),
    __metadata("design:type", String)
], UpdatePropertyPricingResponseDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mukuni Chalet' }),
    __metadata("design:type", String)
], UpdatePropertyPricingResponseDto.prototype, "propertyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4500000 }),
    __metadata("design:type", Number)
], UpdatePropertyPricingResponseDto.prototype, "pricePerUnitNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ZMW' }),
    __metadata("design:type", String)
], UpdatePropertyPricingResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Confirms that historical past bookings remain unchanged', example: true }),
    __metadata("design:type", Boolean)
], UpdatePropertyPricingResponseDto.prototype, "historicalBookingsPreserved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-30T18:30:00.000Z' }),
    __metadata("design:type", String)
], UpdatePropertyPricingResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=update-property.dto.js.map