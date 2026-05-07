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
exports.PopularController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const popular_service_1 = require("./popular.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let PopularController = class PopularController {
    popularService;
    constructor(popularService) {
        this.popularService = popularService;
    }
    accommodations() {
        return this.popularService.getPopularAccommodations();
    }
    buses() {
        return this.popularService.getPopularBuses();
    }
    attractions() {
        return this.popularService.getPopularAttractions();
    }
    packages() {
        return this.popularService.getPopularPackages();
    }
    sync() {
        return this.popularService.syncPopular();
    }
};
exports.PopularController = PopularController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get popular accommodations' }),
    (0, common_1.Get)('accommodations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularController.prototype, "accommodations", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get popular buses' }),
    (0, common_1.Get)('buses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularController.prototype, "buses", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get popular attractions' }),
    (0, common_1.Get)('attractions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularController.prototype, "attractions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get popular packages' }),
    (0, common_1.Get)('packages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularController.prototype, "packages", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Sync popular tables from booking data (admin only)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)('sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PopularController.prototype, "sync", null);
exports.PopularController = PopularController = __decorate([
    (0, swagger_1.ApiTags)('Popular'),
    (0, common_1.Controller)('popular'),
    __metadata("design:paramtypes", [popular_service_1.PopularService])
], PopularController);
//# sourceMappingURL=popular.controller.js.map