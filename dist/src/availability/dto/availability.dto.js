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
exports.TransportAvailabilityQueryDto = exports.ExperienceAvailabilityQueryDto = exports.SeasonalPricingDto = exports.ExperienceSlotActionResponseDto = exports.ExperienceSlotBlockDto = exports.UnblockDatesResponseDto = exports.UnblockDatesDto = exports.BlockDatesResponseDto = exports.BlockDatesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class BlockDatesDto {
    propertyId;
    stayId;
    listingId;
    unitId;
    count;
    dateFrom;
    dateTo;
    startDate;
    endDate;
    reason;
}
exports.BlockDatesDto = BlockDatesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Property ID (master property)', example: 'uuid-prop-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-stay-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "stayId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-prop-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-stay-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of inventory units to block (default: all units)', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BlockDatesDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-05' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-05' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for blocking (e.g. Maintenance / Repairs)', example: 'Maintenance / Repairs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockDatesDto.prototype, "reason", void 0);
class BlockDatesResponseDto {
    success;
    blockedRangeId;
    listingId;
    startDate;
    endDate;
    reason;
}
exports.BlockDatesResponseDto = BlockDatesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BlockDatesResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Generated block range ID', example: 'blk-9012' }),
    __metadata("design:type", String)
], BlockDatesResponseDto.prototype, "blockedRangeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-prop-1' }),
    __metadata("design:type", String)
], BlockDatesResponseDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-01' }),
    __metadata("design:type", String)
], BlockDatesResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-05' }),
    __metadata("design:type", String)
], BlockDatesResponseDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Maintenance / Repairs' }),
    __metadata("design:type", String)
], BlockDatesResponseDto.prototype, "reason", void 0);
class UnblockDatesDto {
    propertyId;
    listingId;
    startDate;
    endDate;
    unitId;
    count;
}
exports.UnblockDatesDto = UnblockDatesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Property ID (inventory identifier)', example: 'uuid-prop-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnblockDatesDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Listing property ID (alias for propertyId)', example: 'uuid-prop-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnblockDatesDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date (YYYY-MM-DD)', example: '2026-10-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UnblockDatesDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date (YYYY-MM-DD)', example: '2026-10-05' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UnblockDatesDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional specific unit ID', example: 'uuid-stay-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnblockDatesDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of inventory units to unblock (default: all)', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UnblockDatesDto.prototype, "count", void 0);
class UnblockDatesResponseDto {
    success;
    message;
}
exports.UnblockDatesResponseDto = UnblockDatesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UnblockDatesResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dates unblocked successfully.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnblockDatesResponseDto.prototype, "message", void 0);
class ExperienceSlotBlockDto {
    propertyId;
    experienceId;
    date;
    slot;
}
exports.ExperienceSlotBlockDto = ExperienceSlotBlockDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Property ID or Experience ID', example: 'uuid-prop-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceSlotBlockDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-exp-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceSlotBlockDto.prototype, "experienceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target date (YYYY-MM-DD)', example: '2026-10-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExperienceSlotBlockDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time slot string (e.g. 09:00 AM or 14:00)', example: '09:00 AM' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceSlotBlockDto.prototype, "slot", void 0);
class ExperienceSlotActionResponseDto {
    success;
    message;
}
exports.ExperienceSlotActionResponseDto = ExperienceSlotActionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ExperienceSlotActionResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Slot 09:00 AM blocked for 2026-10-01' }),
    __metadata("design:type", String)
], ExperienceSlotActionResponseDto.prototype, "message", void 0);
class SeasonalPricingDto {
    stayId;
    listingId;
    from;
    to;
    price;
    label;
}
exports.SeasonalPricingDto = SeasonalPricingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-stay-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeasonalPricingDto.prototype, "stayId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-listing-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeasonalPricingDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SeasonalPricingDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-31' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SeasonalPricingDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SeasonalPricingDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Peak Season' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeasonalPricingDto.prototype, "label", void 0);
class ExperienceAvailabilityQueryDto {
    date;
}
exports.ExperienceAvailabilityQueryDto = ExperienceAvailabilityQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExperienceAvailabilityQueryDto.prototype, "date", void 0);
class TransportAvailabilityQueryDto {
    date;
}
exports.TransportAvailabilityQueryDto = TransportAvailabilityQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TransportAvailabilityQueryDto.prototype, "date", void 0);
//# sourceMappingURL=availability.dto.js.map