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
const accommodations_service_1 = require("../accommodations/accommodations.service");
const create_accommodation_dto_1 = require("../accommodations/dto/create-accommodation.dto");
const update_accommodation_dto_1 = require("../accommodations/dto/update-accommodation.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let HostController = class HostController {
    hostsService;
    dashboardService;
    accommodationsService;
    constructor(hostsService, dashboardService, accommodationsService) {
        this.hostsService = hostsService;
        this.dashboardService = dashboardService;
        this.accommodationsService = accommodationsService;
    }
    async dashboard(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getDashboard(host.id);
    }
    async earnings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getEarnings(host.id);
    }
    async calendar(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getCalendar(host.id, id);
    }
    async getListings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getListings(host.id);
    }
    async createListing(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.accommodationsService.create(host.id, dto);
    }
    async updateListing(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.accommodationsService.update(id, host.id, dto);
    }
    async deleteListing(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.accommodationsService.remove(id, host.id);
    }
};
exports.HostController = HostController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get host dashboard stats, recent bookings, and listings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('earnings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get host earnings total and monthly breakdown' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "earnings", null);
__decorate([
    (0, common_1.Get)('calendar/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking calendar for a listing' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "calendar", null);
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: "Get host's own listings" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getListings", null);
__decorate([
    (0, common_1.Post)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new listing' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_accommodation_dto_1.CreateAccommodationDto]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "createListing", null);
__decorate([
    (0, common_1.Patch)('listings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a listing' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_accommodation_dto_1.UpdateAccommodationDto]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "updateListing", null);
__decorate([
    (0, common_1.Delete)('listings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a listing' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "deleteListing", null);
exports.HostController = HostController = __decorate([
    (0, swagger_1.ApiTags)('Host'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Controller)('host'),
    __metadata("design:paramtypes", [hosts_service_1.HostsService,
        host_dashboard_service_1.HostDashboardService,
        accommodations_service_1.AccommodationsService])
], HostController);
//# sourceMappingURL=host.controller.js.map