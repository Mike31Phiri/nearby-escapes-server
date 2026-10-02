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
const policy_dto_1 = require("../policies/dto/policy.dto");
const properties_service_1 = require("../properties/properties.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hosts_service_1 = require("./hosts.service");
const host_dashboard_service_1 = require("./host-dashboard.service");
const bookings_service_1 = require("../bookings/bookings.service");
const update_host_settings_dto_1 = require("./dto/update-host-settings.dto");
const host_overview_dto_1 = require("./dto/host-overview.dto");
const host_schedule_dto_1 = require("./dto/host-schedule.dto");
const host_bookings_dto_1 = require("./dto/host-bookings.dto");
const host_finances_dto_1 = require("./dto/host-finances.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let HostController = class HostController {
    propertiesService;
    hostsService;
    dashboardService;
    bookingsService;
    constructor(propertiesService, hostsService, dashboardService, bookingsService) {
        this.propertiesService = propertiesService;
        this.hostsService = hostsService;
        this.dashboardService = dashboardService;
        this.bookingsService = bookingsService;
    }
    async overview(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getOverview(host.id);
    }
    async scheduleToday(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getTodaySchedule(host.id);
    }
    async getBookings(user, query) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        const data = await this.dashboardService.getBookings(host.id, query);
        return {
            data,
            meta: {
                page: Math.max(1, Number(query.page) || 1),
                limit: Math.max(1, Math.min(100, Number(query.limit) || 20)),
            },
        };
    }
    async getBookingDetail(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getBookingDetail(host.id, id);
    }
    async getFinancesSummary(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getFinancesSummary(host.id);
    }
    async checkInSchedule(user, bookingId) {
        const result = await this.bookingsService.checkIn(bookingId, user.id);
        return {
            bookingRef: result.booking.bookingRef,
            status: 'checked_in',
            checkInTimestamp: result.booking.checkedInAt || new Date().toISOString(),
        };
    }
    async checkOutSchedule(user, bookingId) {
        const result = await this.bookingsService.checkOut(bookingId, user.id);
        return {
            bookingRef: result.booking.bookingRef,
            status: 'checked_out',
            checkOutTimestamp: result.booking.checkedOutAt || new Date().toISOString(),
        };
    }
    async dashboard(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getDashboard(host.id);
    }
    async earnings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.dashboardService.getEarnings(host.id);
    }
    async getListings(user, fields) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        const all = await this.dashboardService.getListings(host.id);
        if (fields) {
            const wanted = new Set(fields.split(',').map((f) => f.trim()));
            if (wanted.has('id') && wanted.has('name') && wanted.has('type') && wanted.size <= 3) {
                return all.map((l) => ({ id: l.id, name: l.name, type: l.type }));
            }
        }
        return all;
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
    async addPayoutMethod(user, dto) {
        return this.hostsService.addPayoutMethod(user.id, dto);
    }
    async removePayoutMethod(user, id) {
        return this.hostsService.removePayoutMethod(user.id, id);
    }
    async setDefaultPayoutMethod(user, id) {
        return this.hostsService.setDefaultPayoutMethod(user.id, id);
    }
    async updatePropertyPolicies(user, propertyId, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.propertiesService.updatePropertyPolicies(propertyId, host.id, dto);
    }
};
exports.HostController = HostController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Host dashboard overview with operational stats' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: host_overview_dto_1.HostOverviewDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('schedule/today'),
    (0, swagger_1.ApiOperation)({ summary: "Today's operational schedule queue (arriving, hosting, departing)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: host_schedule_dto_1.HostScheduleTodayDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "scheduleToday", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get host bookings list with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [host_bookings_dto_1.HostBookingListItemDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, host_bookings_dto_1.GetHostBookingsQueryDto]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Get)('bookings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Full booking details modal (host view)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getBookingDetail", null);
__decorate([
    (0, common_1.Get)('finances/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get host finances and payout summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: host_finances_dto_1.HostFinancesSummaryDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getFinancesSummary", null);
__decorate([
    (0, common_1.Patch)('schedule/:bookingId/check-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check-in guest via operational schedule queue' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: host_schedule_dto_1.HostCheckInResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "checkInSchedule", null);
__decorate([
    (0, common_1.Patch)('schedule/:bookingId/check-out'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check-out guest via operational schedule queue' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: host_schedule_dto_1.HostCheckOutResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "checkOutSchedule", null);
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
    (0, swagger_1.ApiOperation)({ summary: "Host's listings — minimal shape for dropdowns (?fields=id,name,type), full stats otherwise" }),
    (0, swagger_1.ApiQuery)({ name: 'fields', required: false, description: 'Comma-separated fields to include (e.g. id,name,type)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('fields')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
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
__decorate([
    (0, common_1.Post)('payout-methods'),
    (0, swagger_1.ApiOperation)({ summary: 'Add or update host payout method (Bank or Mobile Money)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payout method saved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, host_finances_dto_1.AddHostPayoutMethodDto]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "addPayoutMethod", null);
__decorate([
    (0, common_1.Delete)('payout-methods/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove host payout method' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payout method removed' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "removePayoutMethod", null);
__decorate([
    (0, common_1.Patch)('payout-methods/:id/default'),
    (0, swagger_1.ApiOperation)({ summary: 'Set primary default payout method' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Default payout method updated' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "setDefaultPayoutMethod", null);
__decorate([
    (0, common_1.Put)('properties/:propertyId/policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Host Property Policies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Property policies updated successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('propertyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, policy_dto_1.UpdatePropertyPoliciesDto]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "updatePropertyPolicies", null);
exports.HostController = HostController = __decorate([
    (0, swagger_1.ApiTags)('Host'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Controller)('host'),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService,
        hosts_service_1.HostsService,
        host_dashboard_service_1.HostDashboardService,
        bookings_service_1.BookingsService])
], HostController);
//# sourceMappingURL=host.controller.js.map