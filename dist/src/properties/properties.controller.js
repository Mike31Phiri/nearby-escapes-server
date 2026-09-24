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
exports.PropertiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const properties_service_1 = require("./properties.service");
const read_store_service_1 = require("../read-store/read-store.service");
const property_sync_interceptor_1 = require("../read-store/property-sync.interceptor");
const create_property_dto_1 = require("./dto/create-property.dto");
const update_property_dto_1 = require("./dto/update-property.dto");
const create_stay_dto_1 = require("./dto/create-stay.dto");
const create_experience_dto_1 = require("./dto/create-experience.dto");
const create_transport_dto_1 = require("./dto/create-transport.dto");
const properties_query_dto_1 = require("./dto/properties-query.dto");
const property_extras_dto_1 = require("./dto/property-extras.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const hosts_service_1 = require("../hosts/hosts.service");
let PropertiesController = class PropertiesController {
    propertiesService;
    readStore;
    hostsService;
    constructor(propertiesService, readStore, hostsService) {
        this.propertiesService = propertiesService;
        this.readStore = readStore;
        this.hostsService = hostsService;
    }
    findAll(query) {
        return this.readStore.searchProperties(query);
    }
    findByHost(hostId) {
        return this.propertiesService.findByHost(hostId);
    }
    findOne(id) {
        return this.readStore.getPropertyById(id);
    }
    async create(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.createProperty(host.id, dto);
    }
    async update(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.update(id, host.id, dto);
    }
    async remove(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.remove(id, host.id);
    }
    listStays(id) {
        return this.propertiesService.listStays(id);
    }
    async addStay(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addStay(id, host.id, dto);
    }
    async updateStay(user, id, stayId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updateStay(id, stayId, host.id, dto);
    }
    async removeStay(user, id, stayId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeStay(id, stayId, host.id);
    }
    listExperiences(id) {
        return this.propertiesService.listExperiences(id);
    }
    async addExperience(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addExperience(id, host.id, dto);
    }
    async updateExperience(user, id, experienceId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updateExperience(id, experienceId, host.id, dto);
    }
    async removeExperience(user, id, experienceId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeExperience(id, experienceId, host.id);
    }
    listTransports(id) {
        return this.propertiesService.listTransports(id);
    }
    async addTransport(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addTransport(id, host.id, dto);
    }
    async updateTransport(user, id, transportId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updateTransport(id, transportId, host.id, dto);
    }
    async removeTransport(user, id, transportId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeTransport(id, transportId, host.id);
    }
    async addImages(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addImages(id, host.id, dto.images);
    }
    async removeImage(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeImage(id, host.id, dto.imageUrl);
    }
    async addAmenity(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addAmenity(id, host.id, dto.name, dto.icon);
    }
    async removeAmenity(user, id, amenityId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeAmenity(id, host.id, amenityId);
    }
    async addRule(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addRule(id, host.id, dto.rule);
    }
    async removeRule(user, id, ruleId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeRule(id, host.id, ruleId);
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search and filter properties — served from Elasticsearch' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [properties_query_dto_1.PropertiesQueryDto]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('host/:hostId'),
    (0, swagger_1.ApiOperation)({ summary: 'All properties for a host — served from DB (host context)' }),
    __param(0, (0, common_1.Param)('hostId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "findByHost", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Single property detail (with all units) — served from Redis' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Create a property business brand' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_property_dto_1.CreatePropertyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update property master entity' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_property_dto_1.UpdatePropertyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/stays'),
    (0, swagger_1.ApiOperation)({ summary: 'List all stay units for a property' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listStays", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/stays'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Add a room/chalet/unit to a STAY property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_stay_dto_1.CreateStayDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addStay", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/stays/:stayId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update a room/chalet/unit' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('stayId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_stay_dto_1.UpdateStayDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updateStay", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id/stays/:stayId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a room/chalet/unit' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('stayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeStay", null);
__decorate([
    (0, common_1.Get)(':id/experiences'),
    (0, swagger_1.ApiOperation)({ summary: 'List all experience packages for a property' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listExperiences", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/experiences'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Add a tour/package to an EXPERIENCE property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_experience_dto_1.CreateExperienceDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addExperience", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/experiences/:experienceId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update an experience package' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('experienceId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_experience_dto_1.UpdateExperienceDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updateExperience", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id/experiences/:experienceId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Remove an experience package' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('experienceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeExperience", null);
__decorate([
    (0, common_1.Get)(':id/transport'),
    (0, swagger_1.ApiOperation)({ summary: 'List all transport routes for a property' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listTransports", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/transport'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Add a route to a TRANSPORT property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_transport_dto_1.CreateTransportDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addTransport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/transport/:transportId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update a transport route' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('transportId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_transport_dto_1.UpdateTransportDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updateTransport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id/transport/:transportId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a transport route' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('transportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeTransport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Add images to property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, property_extras_dto_1.AddImagesDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addImages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id/images'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Remove image from property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, property_extras_dto_1.RemoveImageDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/amenities'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Add dynamic amenity to property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, property_extras_dto_1.AddAmenityDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addAmenity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id/amenities/:amenityId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Remove amenity from property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('amenityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeAmenity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/rules'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Add rule to property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, property_extras_dto_1.AddRuleDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addRule", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id/rules/:ruleId'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Remove rule from property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeRule", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, swagger_1.ApiTags)('Properties'),
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService,
        read_store_service_1.ReadStoreService,
        hosts_service_1.HostsService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map