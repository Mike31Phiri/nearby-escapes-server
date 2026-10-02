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
exports.AdjustInventoryResponseDto = exports.AdjustInventoryDto = exports.DeleteListingResponseDto = exports.UpdateListingStatusResponseDto = exports.UpdateListingStatusDto = exports.CreateUnifiedListingResponseDto = exports.CreateUnifiedListingDto = exports.TransportDetailsDto = exports.TransportFleetUnitItemDto = exports.ExperienceDetailsDto = exports.ExperienceTimeSlotItemDto = exports.StayDetailsDto = exports.StayUnitItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class StayUnitItemDto {
    id;
    name;
    type;
    maxGuests;
}
exports.StayUnitItemDto = StayUnitItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'unit-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StayUnitItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Chalet 1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StayUnitItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'King Room' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StayUnitItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], StayUnitItemDto.prototype, "maxGuests", void 0);
class StayDetailsDto {
    propertyType;
    inventoryCount;
    bedrooms;
    beds;
    baths;
    maxGuests;
    checkInFrom;
    checkInUntil;
    checkOutBefore;
    guestFavourites;
    standoutAmenities;
    safetyAmenities;
    units;
}
exports.StayDetailsDto = StayDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lodge' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StayDetailsDto.prototype, "propertyType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total inventory count (e.g. 15 chalets)', example: 15 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], StayDetailsDto.prototype, "inventoryCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StayDetailsDto.prototype, "bedrooms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StayDetailsDto.prototype, "beds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StayDetailsDto.prototype, "baths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StayDetailsDto.prototype, "maxGuests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '14:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StayDetailsDto.prototype, "checkInFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '20:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StayDetailsDto.prototype, "checkInUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '11:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StayDetailsDto.prototype, "checkOutBefore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['Pool', 'River view'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StayDetailsDto.prototype, "guestFavourites", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['Infinity Pool'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StayDetailsDto.prototype, "standoutAmenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['Smoke alarm', 'First aid kit'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StayDetailsDto.prototype, "safetyAmenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [StayUnitItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StayUnitItemDto),
    __metadata("design:type", Array)
], StayDetailsDto.prototype, "units", void 0);
class ExperienceTimeSlotItemDto {
    id;
    label;
    timeSlot;
    capacity;
}
exports.ExperienceTimeSlotItemDto = ExperienceTimeSlotItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'slot-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceTimeSlotItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Morning Departure' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceTimeSlotItemDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '08:30 AM' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceTimeSlotItemDto.prototype, "timeSlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExperienceTimeSlotItemDto.prototype, "capacity", void 0);
class ExperienceDetailsDto {
    activityType;
    durationMinutes;
    maxParticipants;
    difficulty;
    whatsIncluded;
    whatToBring;
    whatNotToBring;
    meetingPoint;
    timeSlots;
}
exports.ExperienceDetailsDto = ExperienceDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Safari & Wildlife' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceDetailsDto.prototype, "activityType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 180 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ExperienceDetailsDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ExperienceDetailsDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['easy', 'moderate', 'challenging'], example: 'moderate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['easy', 'moderate', 'challenging']),
    __metadata("design:type", String)
], ExperienceDetailsDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['Professional Guide', 'Bottled Water'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExperienceDetailsDto.prototype, "whatsIncluded", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['Sunscreen', 'Hat'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExperienceDetailsDto.prototype, "whatToBring", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['Drones'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExperienceDetailsDto.prototype, "whatNotToBring", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Livingstone Harbor Gate 2' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperienceDetailsDto.prototype, "meetingPoint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ExperienceTimeSlotItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExperienceTimeSlotItemDto),
    __metadata("design:type", Array)
], ExperienceDetailsDto.prototype, "timeSlots", void 0);
class TransportFleetUnitItemDto {
    id;
    label;
    plateNumber;
    seats;
}
exports.TransportFleetUnitItemDto = TransportFleetUnitItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'fleet-1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransportFleetUnitItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Vehicle 1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransportFleetUnitItemDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ABC 1234' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransportFleetUnitItemDto.prototype, "plateNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 14 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TransportFleetUnitItemDto.prototype, "seats", void 0);
class TransportDetailsDto {
    vehicleType;
    seatingCapacity;
    pickupLocation;
    dropoffLocation;
    includesDriver;
    features;
    whatToBring;
    guidelines;
    fleetUnits;
}
exports.TransportDetailsDto = TransportDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Minibus / Shuttle' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransportDetailsDto.prototype, "vehicleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 14 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TransportDetailsDto.prototype, "seatingCapacity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Kenneth Kaunda International Airport' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransportDetailsDto.prototype, "pickupLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Lusaka City Centre' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransportDetailsDto.prototype, "dropoffLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TransportDetailsDto.prototype, "includesDriver", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['Air Conditioning', 'Luggage Space'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TransportDetailsDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['ID / Passport'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TransportDetailsDto.prototype, "whatToBring", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['No smoking inside vehicle'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TransportDetailsDto.prototype, "guidelines", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [TransportFleetUnitItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TransportFleetUnitItemDto),
    __metadata("design:type", Array)
], TransportDetailsDto.prototype, "fleetUnits", void 0);
class CreateUnifiedListingDto {
    vertical;
    inventoryCount;
    title;
    description;
    city;
    province;
    address;
    latitude;
    longitude;
    pricePerUnitNgwee;
    currency;
    images;
    amenities;
    houseRules;
    cancellationPolicy;
    stayDetails;
    experienceDetails;
    transportDetails;
}
exports.CreateUnifiedListingDto = CreateUnifiedListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['stay', 'experience', 'transport'], example: 'stay' }),
    (0, class_validator_1.IsIn)(['stay', 'experience', 'transport']),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total inventory count (e.g. 15 chalets for Mukuni Chalet)', example: 15 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateUnifiedListingDto.prototype, "inventoryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Luxury Zambezi River Lodge' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Stunning lodge overlooking the Zambezi River with private deck.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Livingstone' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Southern Province' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "province", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Plot 45, Riverfront Road' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: -17.8543 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUnifiedListingDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 25.8567 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUnifiedListingDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price per unit in Ngwee (e.g. 450000 = ZMW 4,500.00)', example: 4500000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateUnifiedListingDto.prototype, "pricePerUnitNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ZMW', 'USD'], example: 'ZMW' }),
    (0, class_validator_1.IsIn)(['ZMW', 'USD']),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['https://images.unsplash.com/...'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateUnifiedListingDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['WiFi', 'Swimming Pool', 'Air conditioning'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateUnifiedListingDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['No smoking inside', 'Quiet hours after 22:00'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateUnifiedListingDto.prototype, "houseRules", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['flexible', 'moderate', 'strict'], example: 'moderate' }),
    (0, class_validator_1.IsIn)(['flexible', 'moderate', 'strict']),
    __metadata("design:type", String)
], CreateUnifiedListingDto.prototype, "cancellationPolicy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: StayDetailsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StayDetailsDto),
    __metadata("design:type", StayDetailsDto)
], CreateUnifiedListingDto.prototype, "stayDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ExperienceDetailsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ExperienceDetailsDto),
    __metadata("design:type", ExperienceDetailsDto)
], CreateUnifiedListingDto.prototype, "experienceDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: TransportDetailsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TransportDetailsDto),
    __metadata("design:type", TransportDetailsDto)
], CreateUnifiedListingDto.prototype, "transportDetails", void 0);
class CreateUnifiedListingResponseDto {
    id;
    vertical;
    title;
    slug;
    status;
    pricePerUnitNgwee;
    currency;
    createdAt;
}
exports.CreateUnifiedListingResponseDto = CreateUnifiedListingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-1234' }),
    __metadata("design:type", String)
], CreateUnifiedListingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['stay', 'experience', 'transport'], example: 'stay' }),
    __metadata("design:type", String)
], CreateUnifiedListingResponseDto.prototype, "vertical", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Luxury Zambezi River Lodge' }),
    __metadata("design:type", String)
], CreateUnifiedListingResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'luxury-zambezi-river-lodge-a1b2c3d4' }),
    __metadata("design:type", String)
], CreateUnifiedListingResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['active', 'draft'], example: 'active' }),
    __metadata("design:type", String)
], CreateUnifiedListingResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4500000 }),
    __metadata("design:type", Number)
], CreateUnifiedListingResponseDto.prototype, "pricePerUnitNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ZMW' }),
    __metadata("design:type", String)
], CreateUnifiedListingResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-30T14:30:00.000Z' }),
    __metadata("design:type", String)
], CreateUnifiedListingResponseDto.prototype, "createdAt", void 0);
class UpdateListingStatusDto {
    status;
}
exports.UpdateListingStatusDto = UpdateListingStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['active', 'draft', 'paused', 'archived', 'inactive'],
        example: 'active',
    }),
    (0, class_validator_1.IsIn)(['active', 'draft', 'paused', 'archived', 'inactive']),
    __metadata("design:type", String)
], UpdateListingStatusDto.prototype, "status", void 0);
class UpdateListingStatusResponseDto {
    id;
    status;
    updatedAt;
}
exports.UpdateListingStatusResponseDto = UpdateListingStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-1234' }),
    __metadata("design:type", String)
], UpdateListingStatusResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['active', 'draft', 'paused', 'archived', 'inactive'], example: 'active' }),
    __metadata("design:type", String)
], UpdateListingStatusResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-30T15:00:00.000Z' }),
    __metadata("design:type", String)
], UpdateListingStatusResponseDto.prototype, "updatedAt", void 0);
class DeleteListingResponseDto {
    success;
}
exports.DeleteListingResponseDto = DeleteListingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], DeleteListingResponseDto.prototype, "success", void 0);
class AdjustInventoryDto {
    inventoryCount;
    operation;
    amount;
}
exports.AdjustInventoryDto = AdjustInventoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New absolute inventory count (e.g. 14)', example: 14 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AdjustInventoryDto.prototype, "inventoryCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['increase', 'decrease', 'set'], example: 'decrease' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['increase', 'decrease', 'set']),
    __metadata("design:type", String)
], AdjustInventoryDto.prototype, "operation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Amount to increase or decrease by', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AdjustInventoryDto.prototype, "amount", void 0);
class AdjustInventoryResponseDto {
    id;
    propertyName;
    inventoryCount;
    activeUnitsCount;
    updatedAt;
}
exports.AdjustInventoryResponseDto = AdjustInventoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-1234' }),
    __metadata("design:type", String)
], AdjustInventoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mukuni Chalet' }),
    __metadata("design:type", String)
], AdjustInventoryResponseDto.prototype, "propertyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total active inventory units', example: 14 }),
    __metadata("design:type", Number)
], AdjustInventoryResponseDto.prototype, "inventoryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Count of active room/unit entities', example: 14 }),
    __metadata("design:type", Number)
], AdjustInventoryResponseDto.prototype, "activeUnitsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-30T17:45:00.000Z' }),
    __metadata("design:type", String)
], AdjustInventoryResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=create-listing-unified.dto.js.map