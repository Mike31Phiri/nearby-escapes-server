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
exports.PoliciesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const policies_service_1 = require("./policies.service");
const policy_dto_1 = require("./dto/policy.dto");
let PoliciesController = class PoliciesController {
    policiesService;
    constructor(policiesService) {
        this.policiesService = policiesService;
    }
    getPublished(type) {
        return this.policiesService.getPublishedPolicies(type);
    }
    getBySlug(slug) {
        return this.policiesService.getPolicyBySlug(slug);
    }
};
exports.PoliciesController = PoliciesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all published platform policies (Public)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: policy_dto_1.PolicyTypeEnum, required: false }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PoliciesController.prototype, "getPublished", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get published policy content by slug (Public)' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PoliciesController.prototype, "getBySlug", null);
exports.PoliciesController = PoliciesController = __decorate([
    (0, swagger_1.ApiTags)('Policies'),
    (0, common_1.Controller)('policies'),
    __metadata("design:paramtypes", [policies_service_1.PoliciesService])
], PoliciesController);
//# sourceMappingURL=policies.controller.js.map