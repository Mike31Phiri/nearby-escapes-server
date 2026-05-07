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
exports.AccommodationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const accommodations_service_1 = require("./accommodations.service");
const create_accommodation_dto_1 = require("./dto/create-accommodation.dto");
const update_accommodation_dto_1 = require("./dto/update-accommodation.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const hosts_service_1 = require("../hosts/hosts.service");
let AccommodationsController = class AccommodationsController {
    accommodationsService;
    hostsService;
    constructor(accommodationsService, hostsService) {
        this.accommodationsService = accommodationsService;
        this.hostsService = hostsService;
    }
    findAll() {
        return this.accommodationsService.findAll();
    }
    findOne(id) {
        return this.accommodationsService.findOne(id);
    }
    async create(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.accommodationsService.create(host.id, dto);
    }
    async update(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.accommodationsService.update(id, host.id, dto);
    }
    async remove(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.accommodationsService.remove(id, host.id);
    }
    async myListings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.accommodationsService.findByHost(host.id);
    }
};
exports.AccommodationsController = AccommodationsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccommodationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccommodationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_accommodation_dto_1.CreateAccommodationDto]),
    __metadata("design:returntype", Promise)
], AccommodationsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_accommodation_dto_1.UpdateAccommodationDto]),
    __metadata("design:returntype", Promise)
], AccommodationsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccommodationsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Get)('host/my'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccommodationsController.prototype, "myListings", null);
exports.AccommodationsController = AccommodationsController = __decorate([
    (0, swagger_1.ApiTags)('Accommodations'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('accommodations'),
    __metadata("design:paramtypes", [accommodations_service_1.AccommodationsService,
        hosts_service_1.HostsService])
], AccommodationsController);
//# sourceMappingURL=accommodations.controller.js.map