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
exports.BusesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const buses_service_1 = require("./buses.service");
const create_bus_dto_1 = require("./dto/create-bus.dto");
const update_bus_dto_1 = require("./dto/update-bus.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const hosts_service_1 = require("../hosts/hosts.service");
let BusesController = class BusesController {
    busesService;
    hostsService;
    constructor(busesService, hostsService) {
        this.busesService = busesService;
        this.hostsService = hostsService;
    }
    findAll() {
        return this.busesService.findAll();
    }
    findOne(id) {
        return this.busesService.findOne(id);
    }
    async create(user, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.busesService.create(host.id, dto);
    }
    async update(user, id, dto) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.busesService.update(id, host.id, dto);
    }
    async remove(user, id) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.busesService.remove(id, host.id);
    }
    async myListings(user) {
        const host = await this.hostsService.findApprovedByUserId(user.id);
        return this.busesService.findByHost(host.id);
    }
};
exports.BusesController = BusesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_bus_dto_1.CreateBusDto]),
    __metadata("design:returntype", Promise)
], BusesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_bus_dto_1.UpdateBusDto]),
    __metadata("design:returntype", Promise)
], BusesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Get)('host/my'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusesController.prototype, "myListings", null);
exports.BusesController = BusesController = __decorate([
    (0, swagger_1.ApiTags)('Buses'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('buses'),
    __metadata("design:paramtypes", [buses_service_1.BusesService,
        hosts_service_1.HostsService])
], BusesController);
//# sourceMappingURL=buses.controller.js.map