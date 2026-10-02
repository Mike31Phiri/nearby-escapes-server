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
exports.AddHostPayoutMethodDto = exports.HostFinancesSummaryDto = exports.HostPayoutMethodItemDto = exports.HostPayoutMethodDetailsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class HostPayoutMethodDetailsDto {
    bankName;
    accountNumber;
    accountName;
    branchCode;
    swiftCode;
    provider;
    mobileNumber;
}
exports.HostPayoutMethodDetailsDto = HostPayoutMethodDetailsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Absa Bank Zambia' }),
    __metadata("design:type", String)
], HostPayoutMethodDetailsDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1234567890' }),
    __metadata("design:type", String)
], HostPayoutMethodDetailsDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Banda' }),
    __metadata("design:type", String)
], HostPayoutMethodDetailsDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '001' }),
    __metadata("design:type", String)
], HostPayoutMethodDetailsDto.prototype, "branchCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ABSAZMLX' }),
    __metadata("design:type", String)
], HostPayoutMethodDetailsDto.prototype, "swiftCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['Airtel Money', 'MTN Mobile Money'], example: 'Airtel Money' }),
    __metadata("design:type", String)
], HostPayoutMethodDetailsDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+260971234567' }),
    __metadata("design:type", String)
], HostPayoutMethodDetailsDto.prototype, "mobileNumber", void 0);
class HostPayoutMethodItemDto {
    id;
    type;
    isDefault;
    details;
}
exports.HostPayoutMethodItemDto = HostPayoutMethodItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pm-1' }),
    __metadata("design:type", String)
], HostPayoutMethodItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['bank_transfer', 'mobile_money'], example: 'bank_transfer' }),
    __metadata("design:type", String)
], HostPayoutMethodItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], HostPayoutMethodItemDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: HostPayoutMethodDetailsDto }),
    __metadata("design:type", HostPayoutMethodDetailsDto)
], HostPayoutMethodItemDto.prototype, "details", void 0);
class HostFinancesSummaryDto {
    currency;
    availableBalanceNgwee;
    pendingPayoutsNgwee;
    lifetimeEarningsNgwee;
    nextPayoutDate;
    payoutMethods;
}
exports.HostFinancesSummaryDto = HostFinancesSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ZMW' }),
    __metadata("design:type", String)
], HostFinancesSummaryDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available balance ready for payout (in Ngwee)', example: 3840000 }),
    __metadata("design:type", Number)
], HostFinancesSummaryDto.prototype, "availableBalanceNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pending payouts in progress (in Ngwee)', example: 1200000 }),
    __metadata("design:type", Number)
], HostFinancesSummaryDto.prototype, "pendingPayoutsNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lifetime gross/net earnings (in Ngwee)', example: 18450000 }),
    __metadata("design:type", Number)
], HostFinancesSummaryDto.prototype, "lifetimeEarningsNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Next scheduled settlement date (YYYY-MM-DD)', example: '2026-10-02' }),
    __metadata("design:type", String)
], HostFinancesSummaryDto.prototype, "nextPayoutDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [HostPayoutMethodItemDto] }),
    __metadata("design:type", Array)
], HostFinancesSummaryDto.prototype, "payoutMethods", void 0);
class AddHostPayoutMethodDto {
    type;
    isDefault;
    details;
    bankName;
    accountNumber;
    accountName;
    provider;
    mobileNumber;
}
exports.AddHostPayoutMethodDto = AddHostPayoutMethodDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['bank_transfer', 'mobile_money'], example: 'mobile_money' }),
    __metadata("design:type", String)
], AddHostPayoutMethodDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    __metadata("design:type", Boolean)
], AddHostPayoutMethodDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: HostPayoutMethodDetailsDto }),
    __metadata("design:type", HostPayoutMethodDetailsDto)
], AddHostPayoutMethodDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Absa Bank Zambia' }),
    __metadata("design:type", String)
], AddHostPayoutMethodDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1234567890' }),
    __metadata("design:type", String)
], AddHostPayoutMethodDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mwamba Chali' }),
    __metadata("design:type", String)
], AddHostPayoutMethodDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Airtel Money' }),
    __metadata("design:type", String)
], AddHostPayoutMethodDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+260971234567' }),
    __metadata("design:type", String)
], AddHostPayoutMethodDto.prototype, "mobileNumber", void 0);
//# sourceMappingURL=host-finances.dto.js.map