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
exports.HostsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hosts_service_1 = require("./hosts.service");
const create_host_dto_1 = require("./dto/create-host.dto");
const update_host_settings_dto_1 = require("./dto/update-host-settings.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let HostsController = class HostsController {
    hostsService;
    constructor(hostsService) {
        this.hostsService = hostsService;
    }
    becomeHost(user, dto) {
        return this.hostsService.createHost(user.id, dto);
    }
    myHostProfile(user) {
        return this.hostsService.findByUserId(user.id);
    }
    hostStatus(user) {
        return this.hostsService.getHostStatus(user.id);
    }
    getHostSettings(user) {
        return this.hostsService.getHostSettings(user.id);
    }
    updateHostSettings(user, dto) {
        return this.hostsService.updateHostSettings(user.id, dto);
    }
    findOne(id) {
        return this.hostsService.findById(id);
    }
};
exports.HostsController = HostsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Upgrade current guest to host' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('GUEST'),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_host_dto_1.CreateHostDto]),
    __metadata("design:returntype", void 0)
], HostsController.prototype, "becomeHost", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current user host profile' }),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HostsController.prototype, "myHostProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get host approval status — never throws, always returns status' }),
    (0, common_1.Get)('me/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HostsController.prototype, "hostStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get host settings including checkin/checkout times' }),
    (0, common_1.Get)('me/settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HostsController.prototype, "getHostSettings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update host settings including checkin/checkout times and payout account' }),
    (0, common_1.Patch)('me/settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_host_settings_dto_1.UpdateHostSettingsDto]),
    __metadata("design:returntype", void 0)
], HostsController.prototype, "updateHostSettings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get host by ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HostsController.prototype, "findOne", null);
exports.HostsController = HostsController = __decorate([
    (0, swagger_1.ApiTags)('Hosts'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('hosts'),
    __metadata("design:paramtypes", [hosts_service_1.HostsService])
], HostsController);
//# sourceMappingURL=hosts.controller.js.map