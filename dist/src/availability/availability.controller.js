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
exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const availability_service_1 = require("./availability.service");
const availability_dto_1 = require("./dto/availability.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let AvailabilityController = class AvailabilityController {
    availabilityService;
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    getStayAvailability(stayId, year, month) {
        return this.availabilityService.getStayAvailability(stayId, year ? +year : undefined, month ? +month : undefined);
    }
    getExperienceAvailability(experienceId, query) {
        return this.availabilityService.getExperienceAvailability(experienceId, query.date);
    }
    getTransportAvailability(transportId, query) {
        return this.availabilityService.getTransportAvailability(transportId, query.date);
    }
    getPropertyAvailability(propertyId, year, month) {
        return this.availabilityService.getPropertyAvailability(propertyId, year ? +year : undefined, month ? +month : undefined);
    }
    getAvailability(listingId, year, month) {
        return this.availabilityService.getAvailability(listingId, year ? +year : undefined, month ? +month : undefined);
    }
    async unblockDatesEndpoint(user, dto) {
        const result = await this.availabilityService.unblockDates(dto, user.id);
        return { success: result.success, message: 'Dates unblocked successfully.' };
    }
    async blockDatesEndpoint(user, dto) {
        const listingId = dto.listingId || dto.propertyId || '';
        const startDate = dto.startDate;
        const endDate = dto.endDate;
        const reason = dto.reason;
        await this.availabilityService.blockDates(dto, user.id);
        const blockedRangeId = `blk-${Buffer.from(`${listingId}|${startDate}|${endDate}`).toString('base64').replace(/=/g, '').slice(0, 8)}`;
        return {
            success: true,
            blockedRangeId,
            listingId,
            startDate,
            endDate,
            ...(reason ? { reason } : {}),
        };
    }
    async blockExperienceSlot(user, dto) {
        return this.availabilityService.blockExperienceSlot(dto, user.id);
    }
    async unblockExperienceSlot(user, dto) {
        return this.availabilityService.unblockExperienceSlot(dto, user.id);
    }
    blockDates(user, dto) {
        return this.availabilityService.blockDates(dto, user.id);
    }
    unblockDates(user, dto) {
        return this.availabilityService.unblockDates(dto, user.id);
    }
    addSeasonalPricing(user, dto) {
        return this.availabilityService.addSeasonalPricing(dto, user.id);
    }
    removeSeasonalPricing(user, id) {
        return this.availabilityService.removeSeasonalPricing(id, user.id);
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, common_1.Get)('stays/:stayId'),
    (0, swagger_1.ApiOperation)({ summary: 'Month grid of stay availability and 10-minute active holds' }),
    __param(0, (0, common_1.Param)('stayId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "getStayAvailability", null);
__decorate([
    (0, common_1.Get)('experiences/:experienceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Experience time slot availability for a specific date (blocks held/booked slots)' }),
    __param(0, (0, common_1.Param)('experienceId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, availability_dto_1.ExperienceAvailabilityQueryDto]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "getExperienceAvailability", null);
__decorate([
    (0, common_1.Get)('transport/:transportId'),
    (0, swagger_1.ApiOperation)({ summary: 'Transport seat availability for a specific date' }),
    __param(0, (0, common_1.Param)('transportId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, availability_dto_1.TransportAvailabilityQueryDto]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "getTransportAvailability", null);
__decorate([
    (0, common_1.Get)('properties/:propertyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Property-level calendar availability grid' }),
    __param(0, (0, common_1.Param)('propertyId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "getPropertyAvailability", null);
__decorate([
    (0, common_1.Get)(':listingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Availability check (supports propertyId or stayId)' }),
    __param(0, (0, common_1.Param)('listingId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('unblock-dates'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Unblock dates (Host)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: availability_dto_1.UnblockDatesResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, availability_dto_1.UnblockDatesDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "unblockDatesEndpoint", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('block-dates'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Block dates (Host) — returns blockedRangeId + echo' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: availability_dto_1.BlockDatesResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, availability_dto_1.UnblockDatesDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "blockDatesEndpoint", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('experiences/block-slot'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Block an experience time slot for a date' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: availability_dto_1.ExperienceSlotActionResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, availability_dto_1.ExperienceSlotBlockDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "blockExperienceSlot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('experiences/unblock-slot'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Unblock an experience time slot for a date' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: availability_dto_1.ExperienceSlotActionResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, availability_dto_1.ExperienceSlotBlockDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "unblockExperienceSlot", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('block'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Block date range (Host) - Legacy' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, availability_dto_1.BlockDatesDto]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "blockDates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('unblock'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Unblock date range (Host) - Legacy' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, availability_dto_1.BlockDatesDto]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "unblockDates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)('seasonal-pricing'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Add seasonal pricing rule (Host)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, availability_dto_1.SeasonalPricingDto]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "addSeasonalPricing", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)('seasonal-pricing/:id'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove seasonal pricing rule (Host)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AvailabilityController.prototype, "removeSeasonalPricing", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('Availability'),
    (0, common_1.Controller)('availability'),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], AvailabilityController);
//# sourceMappingURL=availability.controller.js.map