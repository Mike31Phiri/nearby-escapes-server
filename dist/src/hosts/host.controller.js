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
exports.HostController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hosts_service_1 = require("./hosts.service");
const host_dashboard_service_1 = require("./host-dashboard.service");
const bookings_service_1 = require("../bookings/bookings.service");
const update_host_settings_dto_1 = require("./dto/update-host-settings.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let HostController = class HostController {
    hostsService;
    dashboardService;
    bookingsService;
    constructor(hostsService, dashboardService, bookingsService) {
        this.hostsService = hostsService;
        this.dashboardService = dashboardService;
        this.bookingsService = bookingsService;
    }
    async dashboard(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getDashboard(host.id);
    }
    async earnings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getEarnings(host.id);
    }
    async getListings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getListings(host.id);
    }
    async getSettings(user) {
        return this.hostsService.getHostSettings(user.id);
    }
    async updateSettings(user, dto) {
        return this.hostsService.updateHostSettings(user.id, dto);
    }
    async checkIn(user, id) {
        return this.bookingsService.checkIn(id, user.id);
    }
    async checkOut(user, id) {
        return this.bookingsService.checkOut(id, user.id);
    }
};
exports.HostController = HostController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Host dashboard stats, recent bookings, reviews, earnings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('earnings'),
    (0, swagger_1.ApiOperation)({ summary: 'Monthly earnings breakdown' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "earnings", null);
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: "Host's own listings with stats" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getListings", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Host settings (usual check-in/out times, payout info)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update host settings (usual check-in/out times, payout info)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_host_settings_dto_1.UpdateHostSettingsDto]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('bookings/:id/check-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm guest check-in & trigger payout release to host' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('bookings/:id/check-out'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm guest check-out & reopen inventory immediately' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "checkOut", null);
exports.HostController = HostController = __decorate([
    (0, swagger_1.ApiTags)('Host'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Controller)('host'),
    __metadata("design:paramtypes", [hosts_service_1.HostsService,
        host_dashboard_service_1.HostDashboardService,
        bookings_service_1.BookingsService])
], HostController);
//# sourceMappingURL=host.controller.js.map