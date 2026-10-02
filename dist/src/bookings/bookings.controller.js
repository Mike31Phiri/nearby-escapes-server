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
const guest_bookings_dto_1 = require("./dto/guest-bookings.dto");
const host_cancel_dto_1 = require("./dto/host-cancel.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    create(user, dto) {
        return this.bookingsService.create(user.id, dto);
    }
    groupedBookings(user, userId) {
        return this.bookingsService.getGuestBookingsGrouped(userId || user.id);
    }
    myTrips(user, userId) {
        return this.bookingsService.getGuestBookingsGrouped(userId || user.id);
    }
    myBookings(user, query) {
        if (query.as === 'host') {
            return this.bookingsService.findMyBookings(user.id, 'host');
        }
        const targetUserId = query.userId || user.id;
        return this.bookingsService.getGuestBookings(targetUserId, query);
    }
    findOne(user, id) {
        return this.bookingsService.findOne(id, user.id, user.role);
    }
    async cancel(user, id, dto) {
        if (dto?.cancelledBy === 'host' || user.role === 'HOST') {
            return this.bookingsService.hostCancel(id, user.id, dto?.reason);
        }
        return this.bookingsService.cancel(id, user.id, dto?.reason);
    }
    releaseHold(user, id) {
        return this.bookingsService.releaseHold(id, user.id);
    }
    checkIn(user, id) {
        return this.bookingsService.checkIn(id, user.id);
    }
    checkOut(user, id) {
        return this.bookingsService.checkOut(id, user.id);
    }
    updateStatus(user, id, status) {
        return this.bookingsService.updateStatus(id, user.id, status);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('grouped'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user bookings grouped into upcoming, active, recent, and cancelled',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: guest_bookings_dto_1.GuestBookingsGroupedDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "groupedBookings", null);
__decorate([
    (0, common_1.Get)('my-trips'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias for grouped user bookings (upcoming, active, recents)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: guest_bookings_dto_1.GuestBookingsGroupedDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "myTrips", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "User's bookings with optional category filtering (upcoming, active, recent, all)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [guest_bookings_dto_1.GuestBookingItemDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "myBookings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Single booking detail' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '4.1 Cancel reservation by booking ID and reopen inventory' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: host_cancel_dto_1.HostCancelReservationResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/release'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Release a 10-minute hold early if user leaves checkout' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "releaseHold", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST', 'ADMIN'),
    (0, common_1.Post)(':id/check-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Host and Admins confirms guest check-in (triggers release of funds to host)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST', 'ADMIN'),
    (0, common_1.Post)(':id/check-out'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Host confirms guest check-out (reopens inventory immediately)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "checkOut", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm/complete booking (host)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "updateStatus", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map