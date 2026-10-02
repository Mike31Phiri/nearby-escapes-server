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
exports.ListingFilterQueryDto = exports.SetListingRecommendationsDto = exports.CreateListingRecommendationDto = exports.SetListingTagsDto = exports.CreateListingTagDto = exports.RecommendationAudienceEnum = exports.TagCategoryEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var TagCategoryEnum;
(function (TagCategoryEnum) {
    TagCategoryEnum["CATEGORY"] = "CATEGORY";
    TagCategoryEnum["AMENITY"] = "AMENITY";
    TagCategoryEnum["ACTIVITY"] = "ACTIVITY";
    TagCategoryEnum["LOCATION"] = "LOCATION";
    TagCategoryEnum["TRIP_TYPE"] = "TRIP_TYPE";
    TagCategoryEnum["VEHICLE_TYPE"] = "VEHICLE_TYPE";
    TagCategoryEnum["OTHER"] = "OTHER";
})(TagCategoryEnum || (exports.TagCategoryEnum = TagCategoryEnum = {}));
var RecommendationAudienceEnum;
(function (RecommendationAudienceEnum) {
    RecommendationAudienceEnum["COUPLES"] = "COUPLES";
    RecommendationAudienceEnum["FAMILIES"] = "FAMILIES";
    RecommendationAudienceEnum["SOLO"] = "SOLO";
    RecommendationAudienceEnum["ADVENTURE"] = "ADVENTURE";
    RecommendationAudienceEnum["NATURE"] = "NATURE";
    RecommendationAudienceEnum["WEEKEND_GETAWAY"] = "WEEKEND_GETAWAY";
    RecommendationAudienceEnum["BUDGET"] = "BUDGET";
    RecommendationAudienceEnum["LUXURY"] = "LUXURY";
    RecommendationAudienceEnum["GENERAL"] = "GENERAL";
})(RecommendationAudienceEnum || (exports.RecommendationAudienceEnum = RecommendationAudienceEnum = {}));
class CreateListingTagDto {
    name;
    category;
    icon;
}
exports.CreateListingTagDto = CreateListingTagDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Safari Lodge', description: 'Name of the tag' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingTagDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: TagCategoryEnum,
        default: TagCategoryEnum.CATEGORY,
        description: 'Tag classification (CATEGORY, AMENITY, ACTIVITY, LOCATION, TRIP_TYPE, VEHICLE_TYPE, OTHER)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TagCategoryEnum),
    __metadata("design:type", String)
], CreateListingTagDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pool', description: 'Optional icon identifier or emoji' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingTagDto.prototype, "icon", void 0);
class SetListingTagsDto {
    tags;
}
exports.SetListingTagsDto = SetListingTagsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of tag objects or simple tag name strings',
        example: [
            { name: 'Safari Lodge', category: 'CATEGORY' },
            { name: 'Swimming Pool', category: 'AMENITY' },
            { name: 'Game Drive', category: 'ACTIVITY' },
            { name: 'Round Travel', category: 'TRIP_TYPE' },
            { name: 'Luxury Coach', category: 'VEHICLE_TYPE' },
        ],
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SetListingTagsDto.prototype, "tags", void 0);
class CreateListingRecommendationDto {
    audience;
    title;
    reason;
    badge;
    sortOrder;
}
exports.CreateListingRecommendationDto = CreateListingRecommendationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: RecommendationAudienceEnum,
        default: RecommendationAudienceEnum.GENERAL,
        description: 'Target audience / theme for this recommendation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RecommendationAudienceEnum),
    __metadata("design:type", String)
], CreateListingRecommendationDto.prototype, "audience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Recommended for Honeymooners & Couples',
        description: 'Headline recommendation label',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingRecommendationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Private plunge pool with stunning sunset views over the Zambezi River.',
        description: 'Why this listing is recommended',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingRecommendationDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "Couples' Choice",
        description: 'Short promotional badge text',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingRecommendationDto.prototype, "badge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingRecommendationDto.prototype, "sortOrder", void 0);
class SetListingRecommendationsDto {
    recommendations;
}
exports.SetListingRecommendationsDto = SetListingRecommendationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [CreateListingRecommendationDto],
        description: 'Array of recommendations for this listing',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateListingRecommendationDto),
    __metadata("design:type", Array)
], SetListingRecommendationsDto.prototype, "recommendations", void 0);
class ListingFilterQueryDto {
    category;
    tag;
    activity;
    amenity;
    location;
    tripType;
    vehicleType;
    recommendation;
}
exports.ListingFilterQueryDto = ListingFilterQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by category tag slug or name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by any tag name or slug' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "tag", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by activity tag (e.g. "Game Drive", "Rafting")' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "activity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by amenity tag (e.g. "WiFi", "AC", "Pool")' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "amenity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by location tag (e.g. "Livingstone", "Waterfront")' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by trip type for buses/transport: ONE_WAY or ROUND_TRIP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "tripType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by vehicle type for buses/transport: Luxury Coach, Minibus, etc.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "vehicleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: RecommendationAudienceEnum,
        description: 'Filter by curated recommendation audience (e.g. COUPLES, FAMILIES, ADVENTURE)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListingFilterQueryDto.prototype, "recommendation", void 0);
//# sourceMappingURL=listing-tag-recommendation.dto.js.map