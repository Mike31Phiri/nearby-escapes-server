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
exports.UpdateHostSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateHostSettingsDto {
    defaultCheckInTime;
    defaultCheckOutTime;
    businessName;
    payoutMethod;
    payoutAccount;
}
exports.UpdateHostSettingsDto = UpdateHostSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Usual / default check-in time (e.g. 14:00)',
        example: '14:00',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'defaultCheckInTime must be in HH:MM 24-hour format (e.g. 14:00)',
    }),
    __metadata("design:type", String)
], UpdateHostSettingsDto.prototype, "defaultCheckInTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Usual / default check-out time (e.g. 10:00)',
        example: '10:00',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'defaultCheckOutTime must be in HH:MM 24-hour format (e.g. 10:00)',
    }),
    __metadata("design:type", String)
], UpdateHostSettingsDto.prototype, "defaultCheckOutTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Host business or trading name',
        example: 'Zambezi Sun Lodges',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateHostSettingsDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred payout method (BANK_TRANSFER or MOBILE_MONEY)',
        example: 'BANK_TRANSFER',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateHostSettingsDto.prototype, "payoutMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payout account details (bank account or mobile money phone number)',
        example: '+260971234567',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateHostSettingsDto.prototype, "payoutAccount", void 0);
//# sourceMappingURL=update-host-settings.dto.js.map