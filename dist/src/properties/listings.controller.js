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
const properties_service_1 = require("./properties.service");
const read_store_service_1 = require("../read-store/read-store.service");
const hosts_service_1 = require("../hosts/hosts.service");
const property_sync_interceptor_1 = require("../read-store/property-sync.interceptor");
const create_listing_unified_dto_1 = require("./dto/create-listing-unified.dto");
const update_property_dto_1 = require("./dto/update-property.dto");
const properties_query_dto_1 = require("./dto/properties-query.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ListingsController = class ListingsController {
    propertiesService;
    readStore;
    hostsService;
    constructor(propertiesService, readStore, hostsService) {
        this.propertiesService = propertiesService;
        this.readStore = readStore;
        this.hostsService = hostsService;
    }
    async createUnified(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.createUnifiedListing(host.id, dto);
    }
    async updateStatus(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updateListingStatus(id, host.id, dto.status);
    }
    async adjustInventory(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.adjustInventoryCount(id, host.id, dto);
    }
    async updatePricing(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updatePropertyPricing(id, host.id, dto);
    }
    async deleteListing(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.deleteListing(id, host.id);
    }
    findAll(query) {
        return this.readStore.searchProperties(query);
    }
    findOne(id) {
        return this.readStore.getPropertyById(id);
    }
    async getListingPolicies(id) {
        return this.propertiesService.getPropertyPolicies(id);
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '3.1 Create Listing (Unified Gateway)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: create_listing_unified_dto_1.CreateUnifiedListingResponseDto }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_unified_dto_1.CreateUnifiedListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "createUnified", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '3.2 Update Listing Status (Publish / Pause / Archive / Inactive)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: create_listing_unified_dto_1.UpdateListingStatusResponseDto }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_unified_dto_1.UpdateListingStatusDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/inventory'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust property inventory count (increase / decrease / set)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: create_listing_unified_dto_1.AdjustInventoryResponseDto }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_unified_dto_1.AdjustInventoryDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "adjustInventory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/pricing'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update master property pricing table (persists historical bookings)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: update_property_dto_1.UpdatePropertyPricingResponseDto }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_property_dto_1.UpdatePropertyPricingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "updatePricing", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '3.3 Delete / Deactivate Listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: create_listing_unified_dto_1.DeleteListingResponseDto }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "deleteListing", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search and filter listings' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [properties_query_dto_1.PropertiesQueryDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single listing detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Public: Fetch Property / Listing Policies' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getListingPolicies", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService,
        read_store_service_1.ReadStoreService,
        hosts_service_1.HostsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map