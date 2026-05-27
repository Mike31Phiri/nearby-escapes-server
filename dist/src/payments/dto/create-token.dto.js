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
exports.CreateTokenDto = exports.BookingDetailsDto = exports.ListingDto = exports.CustomerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CustomerDto {
    name;
    phone;
    email;
}
exports.CustomerDto = CustomerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CustomerDto.prototype, "email", void 0);
class ListingDto {
    id;
    name;
    type;
}
exports.ListingDto = ListingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingDto.prototype, "type", void 0);
class BookingDetailsDto {
    checkIn;
    checkOut;
    date;
    guests;
}
exports.BookingDetailsDto = BookingDetailsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookingDetailsDto.prototype, "checkIn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookingDetailsDto.prototype, "checkOut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookingDetailsDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], BookingDetailsDto.prototype, "guests", void 0);
class CreateTokenDto {
    bookingRef;
    amount;
    currency = 'ZMW';
    customer;
    listing;
    details;
    callbackUrl;
}
exports.CreateTokenDto = CreateTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "bookingRef", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTokenDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CustomerDto),
    __metadata("design:type", CustomerDto)
], CreateTokenDto.prototype, "customer", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ListingDto),
    __metadata("design:type", ListingDto)
], CreateTokenDto.prototype, "listing", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BookingDetailsDto),
    __metadata("design:type", BookingDetailsDto)
], CreateTokenDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTokenDto.prototype, "callbackUrl", void 0);
//# sourceMappingURL=create-token.dto.js.map