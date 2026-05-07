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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const hosts_service_1 = require("../hosts/hosts.service");
let BookingsController = class BookingsController {
    bookingsService;
    hostsService;
    constructor(bookingsService, hostsService) {
        this.bookingsService = bookingsService;
        this.hostsService = hostsService;
    }
    create(user, dto) {
        return this.bookingsService.create(user.id, dto);
    }
    myBookings(user, status, page = '1', limit = '10') {
        return this.bookingsService.findMyBookings(user.id, status, +page, +limit);
    }
    findOne(user, id) {
        return this.bookingsService.findOne(id, user.id);
    }
    async hostBookings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.bookingsService.findHostBookings(host.id);
    }
    cancel(user, id) {
        return this.bookingsService.cancelBooking(id, user.id);
    }
    async approve(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.bookingsService.approveByHost(id, host.id);
    }
    async reject(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.bookingsService.rejectByHost(id, host.id);
    }
    approveByToken(token) {
        return this.bookingsService.approveByToken(token);
    }
    rejectByToken(token) {
        return this.bookingsService.rejectByToken(token);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking (multi-item, group supported)' }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get booking history for current user with optional filters' }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "myBookings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a single booking by ID' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings for current host' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Get)('host/all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "hostBookings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a booking (traveler)' }),
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancel", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Approve a booking (host dashboard)' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "approve", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Reject a booking (host dashboard)' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "reject", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Approve booking via email token link' }),
    (0, common_1.Post)('approve-by-token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "approveByToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Reject booking via email token link' }),
    (0, common_1.Post)('reject-by-token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "rejectByToken", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        hosts_service_1.HostsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map