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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostOverviewDto = exports.HostOverviewStatsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class HostOverviewStatsDto {
    totalRevenueNgwee;
    activeListingsCount;
    todayCheckInsCount;
    todayCheckOutsCount;
    currentlyHostingCount;
    occupancyRatePercent;
    averageRating;
}
exports.HostOverviewStatsDto = HostOverviewStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total revenue in Ngwee (e.g. 4850000 = ZMW 48,500.00)', example: 4850000 }),
    __metadata("design:type", Number)
], HostOverviewStatsDto.prototype, "totalRevenueNgwee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Count of active listings', example: 4 }),
    __metadata("design:type", Number)
], HostOverviewStatsDto.prototype, "activeListingsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Count of today's check-ins", example: 2 }),
    __metadata("design:type", Number)
], HostOverviewStatsDto.prototype, "todayCheckInsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Count of today's check-outs", example: 1 }),
    __metadata("design:type", Number)
], HostOverviewStatsDto.prototype, "todayCheckOutsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Count of guests currently being hosted today', example: 3 }),
    __metadata("design:type", Number)
], HostOverviewStatsDto.prototype, "currentlyHostingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Occupancy rate percentage (0 - 100)', example: 78 }),
    __metadata("design:type", Number)
], HostOverviewStatsDto.prototype, "occupancyRatePercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average rating from guest reviews', example: 4.92 }),
    __metadata("design:type", Number)
], HostOverviewStatsDto.prototype, "averageRating", void 0);
class HostOverviewDto {
    stats;
    unreadNotificationsCount;
}
exports.HostOverviewDto = HostOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: HostOverviewStatsDto }),
    __metadata("design:type", HostOverviewStatsDto)
], HostOverviewDto.prototype, "stats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Count of unread notifications', example: 3 }),
    __metadata("design:type", Number)
], HostOverviewDto.prototype, "unreadNotificationsCount", void 0);
//# sourceMappingURL=host-overview.dto.js.map