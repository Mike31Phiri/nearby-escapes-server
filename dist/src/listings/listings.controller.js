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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const listings_service_1 = require("./listings.service");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const hosts_service_1 = require("../hosts/hosts.service");
let ListingsController = class ListingsController {
    listingsService;
    hostsService;
    constructor(listingsService, hostsService) {
        this.listingsService = listingsService;
        this.hostsService = hostsService;
    }
    findAll(query) {
        return this.listingsService.findAll(query);
    }
    findStay(id) {
        return this.listingsService.findStay(id);
    }
    findExperience(id) {
        return this.listingsService.findExperience(id);
    }
    findTransport(id) {
        return this.listingsService.findTransport(id);
    }
    getCurated(query) {
        return this.listingsService.getCurated(query.type);
    }
    findByHost(hostId) {
        return this.listingsService.findByHost(hostId);
    }
    async createStay(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.createStay(host.id, dto);
    }
    async createExperience(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.createExperience(host.id, dto);
    }
    async createTransport(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.createTransport(host.id, dto);
    }
    async updateStay(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.update(id, host.id, dto);
    }
    async updateExperience(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.update(id, host.id, dto);
    }
    async updateTransport(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.update(id, host.id, dto);
    }
    async remove(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.remove(id, host.id);
    }
    async addImages(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.addImages(id, host.id, dto.images);
    }
    async removeImage(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.listingsService.removeImage(id, host.id, dto.imageUrl);
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search/filter listings' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_listing_dto_1.ListingsQueryDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stays/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Single stay detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findStay", null);
__decorate([
    (0, common_1.Get)('experiences/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Single experience detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findExperience", null);
__decorate([
    (0, common_1.Get)('transport/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Single transport detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findTransport", null);
__decorate([
    (0, common_1.Get)('curated'),
    (0, swagger_1.ApiOperation)({ summary: 'Curated collections (packages / gems)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_listing_dto_1.CuratedQueryDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getCurated", null);
__decorate([
    (0, common_1.Get)('host/:hostId'),
    (0, swagger_1.ApiOperation)({ summary: 'All listings for a host' }),
    __param(0, (0, common_1.Param)('hostId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findByHost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('stays'),
    (0, swagger_1.ApiOperation)({ summary: 'Create stay listing' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_dto_1.CreateStayDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "createStay", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('experiences'),
    (0, swagger_1.ApiOperation)({ summary: 'Create experience' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_dto_1.CreateExperienceDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "createExperience", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('transport'),
    (0, swagger_1.ApiOperation)({ summary: 'Create transport' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_dto_1.CreateTransportDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "createTransport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)('stays/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stay' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "updateStay", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)('experiences/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update experience' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "updateExperience", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)('transport/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transport' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "updateTransport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete listing' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/images'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload listing images' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_dto_1.AddImagesDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "addImages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id/images'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove listing image' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_dto_1.RemoveImageDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "removeImage", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listings_service_1.ListingsService,
        hosts_service_1.HostsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map