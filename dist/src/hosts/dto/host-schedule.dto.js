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
exports.HostCheckOutResponseDto = exports.HostCheckInResponseDto = exports.HostScheduleTodayDto = exports.HostScheduleItemDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
class HostScheduleItemDTO {
    id;
    type;
    listingType;
    bookingRef;
    guestName;
    guestPhone;
    guestEmail;
    guestAvatar;
    listingId;
    listingName;
    listingImage;
    checkInDate;
    checkOutDate;
    timeSlot;
    stayProgress;
    guestCount;
    totalAmountNgwee;
    currency;
    status;
}
exports.HostScheduleItemDTO = HostScheduleItemDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID', example: 'uuid-1234' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['arriving', 'hosting', 'departing'], example: 'arriving' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['stay', 'experience', 'transport'], example: 'stay' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "listingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking reference code', example: 'NE-2026-8945' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "bookingRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guest full name', example: 'Jane Doe' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "guestName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guest contact phone', example: '+260971234567' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "guestPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guest email address', example: 'jane@example.com' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "guestEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guest avatar URL', example: 'https://images.unsplash.com/...' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "guestAvatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Listing property ID', example: 'uuid-prop-1' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Listing name / title', example: 'Zambezi Riverfront Villa' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "listingName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Listing primary image URL', example: 'https://images.unsplash.com/...' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "listingImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Check-in or activity date (YYYY-MM-DD)', example: '2026-09-30' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "checkInDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out date for stays (YYYY-MM-DD)', example: '2026-10-04' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "checkOutDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Time slot for experiences/transports', example: '08:30 AM' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "timeSlot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stay progress summary', example: 'Night 2 of 4' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "stayProgress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of guests', example: 2 }),
    __metadata("design:type", Number)
], HostScheduleItemDTO.prototype, "guestCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount in Ngwee', example: 450000 }),
    __metadata("design:type", Number)
], HostScheduleItemDTO.prototype, "totalAmountNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ZMW', 'USD'], example: 'ZMW' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['confirmed', 'checked_in', 'checked_out'], example: 'confirmed' }),
    __metadata("design:type", String)
], HostScheduleItemDTO.prototype, "status", void 0);
class HostScheduleTodayDto {
    arriving;
    hosting;
    departing;
}
exports.HostScheduleTodayDto = HostScheduleTodayDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [HostScheduleItemDTO] }),
    __metadata("design:type", Array)
], HostScheduleTodayDto.prototype, "arriving", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [HostScheduleItemDTO] }),
    __metadata("design:type", Array)
], HostScheduleTodayDto.prototype, "hosting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [HostScheduleItemDTO] }),
    __metadata("design:type", Array)
], HostScheduleTodayDto.prototype, "departing", void 0);
class HostCheckInResponseDto {
    bookingRef;
    status;
    checkInTimestamp;
}
exports.HostCheckInResponseDto = HostCheckInResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking reference code', example: 'NE-2026-8945' }),
    __metadata("design:type", String)
], HostCheckInResponseDto.prototype, "bookingRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'checked_in' }),
    __metadata("design:type", String)
], HostCheckInResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ISO 8601 timestamp of check-in', example: '2026-09-30T14:30:00.000Z' }),
    __metadata("design:type", String)
], HostCheckInResponseDto.prototype, "checkInTimestamp", void 0);
class HostCheckOutResponseDto {
    bookingRef;
    status;
    checkOutTimestamp;
}
exports.HostCheckOutResponseDto = HostCheckOutResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking reference code', example: 'NE-2026-8945' }),
    __metadata("design:type", String)
], HostCheckOutResponseDto.prototype, "bookingRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'checked_out' }),
    __metadata("design:type", String)
], HostCheckOutResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ISO 8601 timestamp of check-out', example: '2026-09-30T10:15:00.000Z' }),
    __metadata("design:type", String)
], HostCheckOutResponseDto.prototype, "checkOutTimestamp", void 0);
//# sourceMappingURL=host-schedule.dto.js.map