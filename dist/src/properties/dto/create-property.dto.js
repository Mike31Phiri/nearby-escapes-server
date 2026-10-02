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
exports.CreatePropertyDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CreatePropertyDto {
    name;
    description;
    location;
    type;
    status;
    isDraft;
    draftStep;
    draftData;
    currency;
    images;
    amenities;
    rules;
    tags;
    recommendations;
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Victoria Falls Safari Lodge' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Stunning lodge overlooking the waterhole', default: '' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Livingstone, Zambia', default: '' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PropertyType, example: client_1.PropertyType.STAY }),
    (0, class_validator_1.IsEnum)(client_1.PropertyType),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PropertyStatus, default: client_1.PropertyStatus.ACTIVE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PropertyStatus),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set to true to save as draft (Save & Exit)', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePropertyDto.prototype, "isDraft", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current step in wizard when saved as draft (e.g. 1, 2, 3)', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "draftStep", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Arbitrary in-progress draft JSON data for frontend state restoration' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePropertyDto.prototype, "draftData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ZMW', default: 'ZMW' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['https://example.com/img1.jpg'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['WiFi', 'Pool'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['No smoking'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "rules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Listing tags (strings or { name, category })' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Curated recommendations ({ audience, title, reason })' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "recommendations", void 0);
//# sourceMappingURL=create-property.dto.js.map