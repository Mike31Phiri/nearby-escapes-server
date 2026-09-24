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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    dashboard() {
        return this.adminService.getDashboardStats();
    }
    getUsers(page, limit, search) {
        return this.adminService.getUsers(page, limit, search);
    }
    updateUserStatus(id, status) {
        return this.adminService.updateUserStatus(id, status);
    }
    getProperties(page, limit, status) {
        return this.adminService.getProperties(page, limit, status);
    }
    getListings(page, limit, status) {
        return this.adminService.getListings(page, limit, status);
    }
    updatePropertyStatus(id, status, reason) {
        return this.adminService.updatePropertyStatus(id, status, reason);
    }
    updateListingStatus(id, status, reason) {
        return this.adminService.updateListingStatus(id, status, reason);
    }
    getBookings(page, limit) {
        return this.adminService.getBookings(page, limit);
    }
    getDisputes(page, limit) {
        return this.adminService.getDisputes(page, limit);
    }
    updateDispute(id, status, resolution) {
        return this.adminService.updateDispute(id, status, resolution);
    }
    getPayouts(page, limit, status) {
        return this.adminService.getPayouts(page, limit, status);
    }
    processPayouts(payoutIds) {
        return this.adminService.processPayouts(payoutIds);
    }
    getActivity(page, limit) {
        return this.adminService.getActivityLog(page, limit);
    }
    getReports() {
        return this.adminService.getReports();
    }
    getSettings() {
        return this.adminService.getSettings();
    }
    updateSettings(settings) {
        return this.adminService.updateSettings(settings);
    }
    approveHost(id) {
        return this.adminService.approveHost(id);
    }
    promoteToAdmin(id) {
        return this.adminService.promoteToAdmin(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform dashboard stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'All users (paginated, filterable)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend/verify user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Get)('properties'),
    (0, swagger_1.ApiOperation)({ summary: 'All properties (incl. moderation queue)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProperties", null);
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'All listings (backwards compatibility)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getListings", null);
__decorate([
    (0, common_1.Patch)('properties/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve/reject property' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updatePropertyStatus", null);
__decorate([
    (0, common_1.Patch)('listings/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve/reject listing (backwards compatibility)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateListingStatus", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'All bookings' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Get)('disputes'),
    (0, swagger_1.ApiOperation)({ summary: 'All disputes' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDisputes", null);
__decorate([
    (0, common_1.Patch)('disputes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update dispute (status, resolution)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('resolution')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateDispute", null);
__decorate([
    (0, common_1.Get)('payouts'),
    (0, swagger_1.ApiOperation)({ summary: 'Monthly payout records' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPayouts", null);
__decorate([
    (0, common_1.Post)('payouts/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process pending payouts' }),
    __param(0, (0, common_1.Body)('payoutIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "processPayouts", null);
__decorate([
    (0, common_1.Get)('activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Activity log (audit trail)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getActivity", null);
__decorate([
    (0, common_1.Get)('reports'),
    (0, swagger_1.ApiOperation)({ summary: 'Analytics/reports' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'System settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update settings' }),
    __param(0, (0, common_1.Body)('settings')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Patch)('hosts/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve host account' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveHost", null);
__decorate([
    (0, common_1.Patch)('users/:id/promote'),
    (0, swagger_1.ApiOperation)({ summary: 'Promote user to admin' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "promoteToAdmin", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map