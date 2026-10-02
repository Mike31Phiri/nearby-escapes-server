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
exports.PoliciesAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const policies_service_1 = require("./policies.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const policy_dto_1 = require("./dto/policy.dto");
let PoliciesAdminController = class PoliciesAdminController {
    policiesService;
    constructor(policiesService) {
        this.policiesService = policiesService;
    }
    findAll(type, search, isPublished, page, limit) {
        return this.policiesService.getAdminPolicies({
            type,
            search,
            isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    findOne(id) {
        return this.policiesService.getAdminPolicyById(id);
    }
    create(dto, user) {
        return this.policiesService.createPolicy(dto, user?.id);
    }
    update(slug, dto, user) {
        return this.policiesService.updatePolicyBySlugOrId(slug, dto, user?.id);
    }
    createVersion(id, dto, user) {
        return this.policiesService.createVersion(id, dto, user?.id);
    }
    setPublishStatus(id, isPublished) {
        return this.policiesService.setPublishStatus(id, !!isPublished);
    }
    remove(id) {
        return this.policiesService.deletePolicy(id);
    }
};
exports.PoliciesAdminController = PoliciesAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all platform policies (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: policy_dto_1.PolicyTypeEnum, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isPublished', type: Boolean, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('isPublished')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PoliciesAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full policy details with all versions (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PoliciesAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create / Publish New Policy Version (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [policy_dto_1.CreatePolicyDto, Object]),
    __metadata("design:returntype", void 0)
], PoliciesAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Existing Policy Document by slug or ID (Admin)' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, policy_dto_1.UpdatePolicyDto, Object]),
    __metadata("design:returntype", void 0)
], PoliciesAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/versions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new version for an existing policy (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, policy_dto_1.CreatePolicyVersionDto, Object]),
    __metadata("design:returntype", void 0)
], PoliciesAdminController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish or unpublish a policy (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isPublished')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], PoliciesAdminController.prototype, "setPublishStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive/soft-delete a policy (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PoliciesAdminController.prototype, "remove", null);
exports.PoliciesAdminController = PoliciesAdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Policies'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Controller)('admin/policies'),
    __metadata("design:paramtypes", [policies_service_1.PoliciesService])
], PoliciesAdminController);
//# sourceMappingURL=policies-admin.controller.js.map