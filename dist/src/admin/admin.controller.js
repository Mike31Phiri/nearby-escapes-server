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
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    dashboard() {
        return this.adminService.getDashboardStats();
    }
    bookingAnalytics() {
        return this.adminService.getBookingAnalytics();
    }
    paymentAnalytics() {
        return this.adminService.getPaymentAnalytics();
    }
    commissions() {
        return this.adminService.getCommissions();
    }
    payouts(pending) {
        return this.adminService.getPayouts(pending === 'true');
    }
    markPaid(id) {
        return this.adminService.markPayoutPaid(id);
    }
    users() {
        return this.adminService.getAllUsers();
    }
    bookings() {
        return this.adminService.getAllBookings();
    }
    approveHost(id) {
        return this.adminService.approveHost(id);
    }
    promoteToAdmin(id, user) {
        return this.adminService.promoteToAdmin(id, user.id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard stats' }),
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "dashboard", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get booking analytics' }),
    (0, common_1.Get)('analytics/bookings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bookingAnalytics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get payment analytics' }),
    (0, common_1.Get)('analytics/payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "paymentAnalytics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all commission records' }),
    (0, common_1.Get)('commissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "commissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all payouts (filter by pending)' }),
    (0, common_1.Get)('payouts'),
    __param(0, (0, common_1.Query)('pending')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "payouts", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Mark a payout as paid' }),
    (0, common_1.Patch)('payouts/:id/paid'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "markPaid", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "users", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings' }),
    (0, common_1.Get)('bookings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bookings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Approve a host account' }),
    (0, common_1.Patch)('hosts/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveHost", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Promote a user to admin' }),
    (0, common_1.Patch)('users/:id/promote-admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
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