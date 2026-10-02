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
exports.HostOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hosts_service_1 = require("./hosts.service");
const onboard_host_dto_1 = require("./dto/onboard-host.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let HostOnboardingController = class HostOnboardingController {
    hostsService;
    constructor(hostsService) {
        this.hostsService = hostsService;
    }
    async onboard(user, dto) {
        return this.hostsService.submitApplication(user.id, dto);
    }
    async applicationStatus(user) {
        return this.hostsService.getApplicationStatus(user.id);
    }
};
exports.HostOnboardingController = HostOnboardingController;
__decorate([
    (0, common_1.Post)('onboard'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit host onboarding & KYC verification application' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Application submitted successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, onboard_host_dto_1.OnboardHostDto]),
    __metadata("design:returntype", Promise)
], HostOnboardingController.prototype, "onboard", null);
__decorate([
    (0, common_1.Get)('application-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check host onboarding application status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application status returned' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostOnboardingController.prototype, "applicationStatus", null);
exports.HostOnboardingController = HostOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Host Onboarding'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('host'),
    __metadata("design:paramtypes", [hosts_service_1.HostsService])
], HostOnboardingController);
//# sourceMappingURL=host-onboarding.controller.js.map