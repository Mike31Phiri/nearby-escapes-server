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
exports.HostBookingListItemDto = exports.GetHostBookingsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GetHostBookingsQueryDto {
    status;
    listingId;
    page = 1;
    limit = 20;
}
exports.GetHostBookingsQueryDto = GetHostBookingsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['confirmed', 'cancelled', 'completed'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['confirmed', 'cancelled', 'completed']),
    __metadata("design:type", String)
], GetHostBookingsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by listing ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetHostBookingsQueryDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number (default 1)', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetHostBookingsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page (default 20)', example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetHostBookingsQueryDto.prototype, "limit", void 0);
class HostBookingListItemDto {
    id;
    bookingRef;
    listingId;
    listingTitle;
    vertical;
    status;
    checkIn;
    checkOut;
    date;
    guests;
    totalNgwee;
    guestName;
    guestPhone;
    createdAt;
}
exports.HostBookingListItemDto = HostBookingListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-1234' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NE-2026-8945' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "bookingRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-prop-1' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Zambezi Riverfront Villa' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "listingTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['stay', 'experience', 'transport'], example: 'stay' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['confirmed', 'cancelled', 'completed'], example: 'confirmed' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Check-in date (YYYY-MM-DD)', example: '2026-10-01', nullable: true }),
    __metadata("design:type", Object)
], HostBookingListItemDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Check-out date (YYYY-MM-DD)', example: '2026-10-05', nullable: true }),
    __metadata("design:type", Object)
], HostBookingListItemDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity/transport date (YYYY-MM-DD)', example: '2026-10-01', nullable: true }),
    __metadata("design:type", Object)
], HostBookingListItemDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], HostBookingListItemDto.prototype, "guests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total price in Ngwee', example: 4500000 }),
    __metadata("design:type", Number)
], HostBookingListItemDto.prototype, "totalNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Banda' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "guestName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+260971234567' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "guestPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-30T14:30:00.000Z' }),
    __metadata("design:type", String)
], HostBookingListItemDto.prototype, "createdAt", void 0);
//# sourceMappingURL=host-bookings.dto.js.map