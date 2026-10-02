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
const policy_dto_1 = require("../policies/dto/policy.dto");
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
const listing_policy_dto_1 = require("./dto/listing-policy.dto");
const listing_tag_recommendation_dto_1 = require("./dto/listing-tag-recommendation.dto");
const create_listing_unified_dto_1 = require("./dto/create-listing-unified.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const hosts_service_1 = require("../hosts/hosts.service");
const popularity_service_1 = require("../popularity/popularity.service");
const client_1 = require("@prisma/client");
let PropertiesController = class PropertiesController {
    propertiesService;
    readStore;
    hostsService;
    popularityService;
    constructor(propertiesService, readStore, hostsService, popularityService) {
        this.propertiesService = propertiesService;
        this.readStore = readStore;
        this.hostsService = hostsService;
        this.popularityService = popularityService;
    }
    findAll(query) {
        return this.readStore.searchProperties(query);
    }
    getPopularStays() {
        return this.popularityService.getPopularStays();
    }
    getPopularExperiences() {
        return this.popularityService.getPopularExperiences();
    }
    getAvailableTags() {
        return this.propertiesService.getAllAvailableTags();
    }
    filterProperties(query) {
        return this.propertiesService.filterByTags(query);
    }
    getSampleImages(category, limit) {
        return this.propertiesService.getSampleImages(category, limit ? parseInt(limit, 10) : undefined);
    }
    getUnitTags(unitType, unitId) {
        return this.propertiesService.getTags(unitType, unitId);
    }
    getUnitRecommendations(unitType, unitId) {
        return this.propertiesService.getRecommendations(unitType, unitId);
    }
    async getMyDrafts(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.findDraftsByHost(host.id);
    }
    async getMyDraftById(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.findDraftById(id, host.id);
    }
    async getMyProperties(user, status) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.findByHost(host.id, status);
    }
    async saveDraft(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.saveDraft(host.id, dto);
    }
    findByHost(hostId) {
        return this.propertiesService.findByHost(hostId, client_1.PropertyStatus.ACTIVE);
    }
    findOne(id) {
        return this.readStore.getPropertyById(id);
    }
    getPropertyTags(id) {
        return this.propertiesService.getTags('property', id);
    }
    getPropertyRecommendations(id) {
        return this.propertiesService.getRecommendations('property', id);
    }
    async create(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.createProperty(host.id, dto);
    }
    async update(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.update(id, host.id, dto);
    }
    async updateDraft(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updateDraft(id, host.id, dto);
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
    async saveWizardStep(user, id, step, payload) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.saveWizardStep(id, host.id, parseInt(step, 10), payload);
    }
    async publish(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.publishListing(id, host.id);
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
    getStayPolicies(stayId) {
        return this.propertiesService.getListingPolicies('stay', stayId);
    }
    async addStayPolicy(user, stayId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addListingPolicy('stay', stayId, host.id, dto);
    }
    async setStayPolicies(user, stayId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.setListingPolicies('stay', stayId, host.id, dto);
    }
    getExperiencePolicies(experienceId) {
        return this.propertiesService.getListingPolicies('experience', experienceId);
    }
    async addExperiencePolicy(user, experienceId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addListingPolicy('experience', experienceId, host.id, dto);
    }
    async setExperiencePolicies(user, experienceId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.setListingPolicies('experience', experienceId, host.id, dto);
    }
    getTransportPolicies(transportId) {
        return this.propertiesService.getListingPolicies('transport', transportId);
    }
    async addTransportPolicy(user, transportId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addListingPolicy('transport', transportId, host.id, dto);
    }
    async setTransportPolicies(user, transportId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.setListingPolicies('transport', transportId, host.id, dto);
    }
    async updateListingPolicy(user, policyId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updateListingPolicy(policyId, host.id, dto);
    }
    async removeListingPolicy(user, policyId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeListingPolicy(policyId, host.id);
    }
    async addPropertyTag(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addTag('property', id, host.id, dto);
    }
    async setPropertyTags(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.setTags('property', id, host.id, dto.tags);
    }
    async removeTag(user, tagId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeTag(tagId, host.id);
    }
    async addPropertyRecommendation(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.addRecommendation('property', id, host.id, dto);
    }
    async setPropertyRecommendations(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.setRecommendations('property', id, host.id, dto.recommendations);
    }
    async removeRecommendation(user, recId) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.removeRecommendation(recId, host.id);
    }
    async setUnitTags(user, unitType, unitId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.setTags(unitType, unitId, host.id, dto.tags);
    }
    async setUnitRecommendations(user, unitType, unitId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.setRecommendations(unitType, unitId, host.id, dto.recommendations);
    }
    async getPropertyPolicies(id) {
        return this.propertiesService.getPropertyPolicies(id);
    }
    async updatePropertyPolicies(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updatePropertyPolicies(id, host.id, dto);
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
    (0, common_1.Get)('popular/stays'),
    (0, swagger_1.ApiOperation)({ summary: 'Top 10 popular stays (Redis cached, midnight 24h cron)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getPopularStays", null);
__decorate([
    (0, common_1.Get)('popular/experiences'),
    (0, swagger_1.ApiOperation)({ summary: 'Top 10 popular experiences (Redis cached, midnight 24h cron)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getPopularExperiences", null);
__decorate([
    (0, common_1.Get)('tags/available'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all distinct tags grouped by category for filter pills and chips' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getAvailableTags", null);
__decorate([
    (0, common_1.Get)('discover'),
    (0, swagger_1.ApiOperation)({ summary: 'Filter and discover properties using tags, category, amenities, activity, trip type, or recommendations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listing_tag_recommendation_dto_1.ListingFilterQueryDto]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "filterProperties", null);
__decorate([
    (0, common_1.Get)('sample-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sample/stock image URLs stored in DB for API testing and mock listing creation' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getSampleImages", null);
__decorate([
    (0, common_1.Get)('units/:unitType/:unitId/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tags for a specific Stay, Experience, or Transport unit' }),
    __param(0, (0, common_1.Param)('unitType')),
    __param(1, (0, common_1.Param)('unitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getUnitTags", null);
__decorate([
    (0, common_1.Get)('units/:unitType/:unitId/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recommendations for a specific Stay, Experience, or Transport unit' }),
    __param(0, (0, common_1.Param)('unitType')),
    __param(1, (0, common_1.Param)('unitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getUnitRecommendations", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Get)('drafts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all draft listings for the authenticated host' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getMyDrafts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Get)('drafts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific draft listing for the authenticated host (wizard resume)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getMyDraftById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Get)('my-properties'),
    (0, swagger_1.ApiOperation)({ summary: 'All properties owned by the authenticated host (can filter ?status=ACTIVE or DRAFT)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getMyProperties", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Save new listing as draft (Save & Exit)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_property_dto_1.CreatePropertyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Get)('host/:hostId'),
    (0, swagger_1.ApiOperation)({ summary: 'Public listings for a host profile (GUESTS ONLY — strictly ACTIVE listings)' }),
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
    (0, common_1.Get)(':id/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'All tags for a property' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getPropertyTags", null);
__decorate([
    (0, common_1.Get)(':id/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'All curated recommendations for a property' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getPropertyRecommendations", null);
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
    (0, common_1.Patch)(':id/draft'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing draft listing (Save & Exit step)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_property_dto_1.UpdatePropertyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updateDraft", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update property status (active, draft, paused, archived, inactive)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: create_listing_unified_dto_1.UpdateListingStatusResponseDto }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_unified_dto_1.UpdateListingStatusDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/inventory'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust property inventory count (increase / decrease / set)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_listing_unified_dto_1.AdjustInventoryDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "adjustInventory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/pricing'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Update master property pricing table (persists historical bookings)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_property_dto_1.UpdatePropertyPricingDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updatePricing", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id/wizard/step/:step'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Save stage data when host clicks Next in listing wizard' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('step')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "saveWizardStep", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseInterceptors)(property_sync_interceptor_1.PropertySyncInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a draft listing (validates completeness and activates)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "publish", null);
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
__decorate([
    (0, common_1.Get)(':id/stays/:stayId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all policies for a stay unit (public)' }),
    __param(0, (0, common_1.Param)('stayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getStayPolicies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/stays/:stayId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a policy to a stay unit' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('stayId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_policy_dto_1.CreateListingPolicyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addStayPolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id/stays/:stayId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk-replace all policies for a stay unit (PUT = full replace)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('stayId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_policy_dto_1.SetListingPoliciesDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "setStayPolicies", null);
__decorate([
    (0, common_1.Get)(':id/experiences/:experienceId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all policies for an experience unit (public)' }),
    __param(0, (0, common_1.Param)('experienceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getExperiencePolicies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/experiences/:experienceId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a policy to an experience unit' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('experienceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_policy_dto_1.CreateListingPolicyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addExperiencePolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id/experiences/:experienceId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk-replace all policies for an experience unit (PUT = full replace)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('experienceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_policy_dto_1.SetListingPoliciesDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "setExperiencePolicies", null);
__decorate([
    (0, common_1.Get)(':id/transport/:transportId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all policies for a transport unit (public)' }),
    __param(0, (0, common_1.Param)('transportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getTransportPolicies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/transport/:transportId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a policy to a transport unit' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('transportId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_policy_dto_1.CreateListingPolicyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addTransportPolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id/transport/:transportId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk-replace all policies for a transport unit (PUT = full replace)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('transportId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_policy_dto_1.SetListingPoliciesDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "setTransportPolicies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)('policies/:policyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a single listing policy' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('policyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_policy_dto_1.UpdateListingPolicyDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updateListingPolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)('policies/:policyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a single listing policy' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('policyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeListingPolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a tag to a property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_tag_recommendation_dto_1.CreateListingTagDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addPropertyTag", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk replace all tags on a property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_tag_recommendation_dto_1.SetListingTagsDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "setPropertyTags", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)('tags/:tagId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a tag' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeTag", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a recommendation to a property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_tag_recommendation_dto_1.CreateListingRecommendationDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "addPropertyRecommendation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk replace all recommendations on a property' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, listing_tag_recommendation_dto_1.SetListingRecommendationsDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "setPropertyRecommendations", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)('recommendations/:recId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a recommendation' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('recId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "removeRecommendation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)('units/:unitType/:unitId/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk replace tags on a specific unit (stay, experience, or transport)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('unitType')),
    __param(2, (0, common_1.Param)('unitId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, listing_tag_recommendation_dto_1.SetListingTagsDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "setUnitTags", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)('units/:unitType/:unitId/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk replace recommendations on a specific unit' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('unitType')),
    __param(2, (0, common_1.Param)('unitId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, listing_tag_recommendation_dto_1.SetListingRecommendationsDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "setUnitRecommendations", null);
__decorate([
    (0, common_1.Get)(':id/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Public: Fetch Property Policies' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "getPropertyPolicies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Put)(':id/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Host: Update Property Policies' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, policy_dto_1.UpdatePropertyPoliciesDto]),
    __metadata("design:returntype", Promise)
], PropertiesController.prototype, "updatePropertyPolicies", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, swagger_1.ApiTags)('Properties'),
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService,
        read_store_service_1.ReadStoreService,
        hosts_service_1.HostsService,
        popularity_service_1.PopularityService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map