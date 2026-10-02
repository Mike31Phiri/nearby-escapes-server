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
exports.GetGuestBookingsQueryDto = exports.GuestBookingsGroupedDto = exports.GuestBookingsStatsDto = exports.GuestBookingItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GuestBookingItemDto {
    id;
    bookingRef;
    listingId;
    listingTitle;
    listingImage;
    location;
    vertical;
    status;
    category;
    checkInDate;
    checkOutDate;
    date;
    timeSlot;
    nightsCount;
    stayProgress;
    guestsCount;
    totalNgwee;
    totalFormatted;
    currency;
    paymentStatus;
    hostName;
    hostPhone;
    createdAt;
}
exports.GuestBookingItemDto = GuestBookingItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-1234' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NE-2026-8945' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "bookingRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-prop-1' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Zambezi Riverfront Villa' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "listingTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://images.unsplash.com/...' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "listingImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Livingstone, Zambia' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['stay', 'experience', 'transport'], example: 'stay' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['confirmed', 'checked_in', 'completed', 'cancelled', 'pending'],
        example: 'confirmed',
    }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['upcoming', 'active', 'recent', 'cancelled'],
        example: 'upcoming',
    }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-01', nullable: true }),
    __metadata("design:type", Object)
], GuestBookingItemDto.prototype, "checkInDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-05', nullable: true }),
    __metadata("design:type", Object)
], GuestBookingItemDto.prototype, "checkOutDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-01', nullable: true }),
    __metadata("design:type", Object)
], GuestBookingItemDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '09:00', nullable: true }),
    __metadata("design:type", Object)
], GuestBookingItemDto.prototype, "timeSlot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    __metadata("design:type", Number)
], GuestBookingItemDto.prototype, "nightsCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Night 1 of 4' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "stayProgress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], GuestBookingItemDto.prototype, "guestsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total price in Ngwee', example: 4500000 }),
    __metadata("design:type", Number)
], GuestBookingItemDto.prototype, "totalNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'K45,000.00' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "totalFormatted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ZMW', 'USD'], example: 'ZMW' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['paid', 'unpaid', 'refunded'], example: 'paid' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Chileshe Kapwepwe' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "hostName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+260971234567' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "hostPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-30T14:30:00.000Z' }),
    __metadata("design:type", String)
], GuestBookingItemDto.prototype, "createdAt", void 0);
class GuestBookingsStatsDto {
    totalBookingsCount;
    upcomingCount;
    activeCount;
    recentCount;
}
exports.GuestBookingsStatsDto = GuestBookingsStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], GuestBookingsStatsDto.prototype, "totalBookingsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], GuestBookingsStatsDto.prototype, "upcomingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], GuestBookingsStatsDto.prototype, "activeCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], GuestBookingsStatsDto.prototype, "recentCount", void 0);
class GuestBookingsGroupedDto {
    upcoming;
    active;
    recent;
    cancelled;
    stats;
}
exports.GuestBookingsGroupedDto = GuestBookingsGroupedDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GuestBookingItemDto] }),
    __metadata("design:type", Array)
], GuestBookingsGroupedDto.prototype, "upcoming", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GuestBookingItemDto] }),
    __metadata("design:type", Array)
], GuestBookingsGroupedDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GuestBookingItemDto] }),
    __metadata("design:type", Array)
], GuestBookingsGroupedDto.prototype, "recent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GuestBookingItemDto] }),
    __metadata("design:type", Array)
], GuestBookingsGroupedDto.prototype, "cancelled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GuestBookingsStatsDto }),
    __metadata("design:type", GuestBookingsStatsDto)
], GuestBookingsGroupedDto.prototype, "stats", void 0);
class GetGuestBookingsQueryDto {
    category;
    userId;
    page = 1;
    limit = 20;
}
exports.GetGuestBookingsQueryDto = GetGuestBookingsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['upcoming', 'active', 'recent', 'cancelled', 'all'],
        description: 'Filter bookings by travel category',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['upcoming', 'active', 'recent', 'cancelled', 'all']),
    __metadata("design:type", String)
], GetGuestBookingsQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional explicit user ID to fetch bookings for' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetGuestBookingsQueryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetGuestBookingsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetGuestBookingsQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=guest-bookings.dto.js.map