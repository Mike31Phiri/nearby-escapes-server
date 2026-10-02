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
exports.PopularityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const popularity_service_1 = require("./popularity.service");
let PopularityController = class PopularityController {
    popularityService;
    constructor(popularityService) {
        this.popularityService = popularityService;
    }
    getPopularStays() {
        return this.popularityService.getPopularStays();
    }
    getPopularExperiences() {
        return this.popularityService.getPopularExperiences();
    }
    getMetadata() {
        return this.popularityService.getMetadata();
    }
    recalculate() {
        return this.popularityService.recalculateAll();
    }
};
exports.PopularityController = PopularityController;
__decorate([
    (0, common_1.Get)('stays'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get top 10 popular stays',
        description: 'Cached in Redis, recalculated every 24 hours at midnight based on confirmed/total bookings.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of up to 10 most popular stays with booking counts and rank.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularityController.prototype, "getPopularStays", null);
__decorate([
    (0, common_1.Get)('experiences'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get top 10 popular experiences',
        description: 'Cached in Redis, recalculated every 24 hours at midnight based on confirmed/total bookings.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of up to 10 most popular experiences with booking counts and rank.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularityController.prototype, "getPopularExperiences", null);
__decorate([
    (0, common_1.Get)('metadata'),
    (0, swagger_1.ApiOperation)({ summary: 'Get popularity cache status and last updated timestamp' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularityController.prototype, "getMetadata", null);
__decorate([
    (0, common_1.Post)('recalculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually trigger 24h popularity calculation and update Redis cache',
        description: 'Recalculates popular stays and experiences immediately from the bookings table and updates Redis keys.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularityController.prototype, "recalculate", null);
exports.PopularityController = PopularityController = __decorate([
    (0, swagger_1.ApiTags)('Popularity'),
    (0, common_1.Controller)('popular'),
    __metadata("design:paramtypes", [popularity_service_1.PopularityService])
], PopularityController);
//# sourceMappingURL=popularity.controller.js.map