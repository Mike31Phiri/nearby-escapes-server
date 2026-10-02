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
exports.HostCancelReservationResponseDto = exports.HostCancelReservationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class HostCancelReservationDto {
    bookingRef;
    reason;
    cancelledBy;
}
exports.HostCancelReservationDto = HostCancelReservationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional booking reference', example: 'NE-2026-8945' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HostCancelReservationDto.prototype, "bookingRef", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional cancellation reason', example: 'Unforeseen maintenance emergency' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HostCancelReservationDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'host' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HostCancelReservationDto.prototype, "cancelledBy", void 0);
class HostCancelReservationResponseDto {
    bookingId;
    bookingRef;
    status;
    inventoryReopened;
    refundAmountNgwee;
    penaltyFeeNgwee;
    cancellationDate;
}
exports.HostCancelReservationResponseDto = HostCancelReservationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' }),
    __metadata("design:type", String)
], HostCancelReservationResponseDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NE-2026-8945' }),
    __metadata("design:type", String)
], HostCancelReservationResponseDto.prototype, "bookingRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cancelled' }),
    __metadata("design:type", String)
], HostCancelReservationResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indicates whether the booked inventory/calendar slots were reopened', example: true }),
    __metadata("design:type", Boolean)
], HostCancelReservationResponseDto.prototype, "inventoryReopened", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full refund amount to guest in Ngwee', example: 4500000 }),
    __metadata("design:type", Number)
], HostCancelReservationResponseDto.prototype, "refundAmountNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Host penalty fee if applicable in Ngwee', example: 0 }),
    __metadata("design:type", Number)
], HostCancelReservationResponseDto.prototype, "penaltyFeeNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-30T15:30:00.000Z' }),
    __metadata("design:type", String)
], HostCancelReservationResponseDto.prototype, "cancellationDate", void 0);
//# sourceMappingURL=host-cancel.dto.js.map