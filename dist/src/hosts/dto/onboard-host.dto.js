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
exports.OnboardHostDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class OnboardHostDto {
    businessName;
    operatingSince;
    province;
    town;
    businessEmail;
    businessPhone;
    pacraDocs;
    ownershipDocs;
    operationDocs;
}
exports.OnboardHostDto = OnboardHostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'South Luangwa Safari Lodge Ltd' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardHostDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2019' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardHostDto.prototype, "operatingSince", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Eastern' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardHostDto.prototype, "province", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mfuwe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardHostDto.prototype, "town", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'reservations@southluangwa.co.zm' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], OnboardHostDto.prototype, "businessEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+260977654321' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardHostDto.prototype, "businessPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: [{ id: 'doc_1', name: 'pacra.pdf', url: 'https://...', size: 1024 }] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], OnboardHostDto.prototype, "pacraDocs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: [{ id: 'doc_2', name: 'title.pdf', url: 'https://...', size: 2048 }] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], OnboardHostDto.prototype, "ownershipDocs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: [{ id: 'doc_3', name: 'permit.pdf', url: 'https://...', size: 512 }] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], OnboardHostDto.prototype, "operationDocs", void 0);
//# sourceMappingURL=onboard-host.dto.js.map