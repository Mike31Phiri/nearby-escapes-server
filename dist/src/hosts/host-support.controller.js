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
exports.HostSupportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_host_support_ticket_dto_1 = require("./dto/create-host-support-ticket.dto");
const host_support_service_1 = require("./host-support.service");
let HostSupportController = class HostSupportController {
    supportService;
    constructor(supportService) {
        this.supportService = supportService;
    }
    async createTicket(req, dto) {
        const hostId = req.user?.id || 'host_user_782';
        return this.supportService.createTicket(hostId, dto);
    }
    async getTickets(req, status, topic, page = 1, limit = 20) {
        const hostId = req.user?.id || 'host_user_782';
        return this.supportService.getHostTickets(hostId, {
            status,
            topic,
            page: Number(page) || 1,
            limit: Number(limit) || 20,
        });
    }
    async getTicketDetails(req, ticketId) {
        const hostId = req.user?.id || 'host_user_782';
        return this.supportService.getTicketById(hostId, ticketId);
    }
};
exports.HostSupportController = HostSupportController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a new host support or dispute ticket' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket created successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_host_support_ticket_dto_1.CreateHostSupportTicketDto]),
    __metadata("design:returntype", Promise)
], HostSupportController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List host support tickets with status filter and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of host support tickets' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('topic')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], HostSupportController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Get)(':ticketId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details, thread, and timeline for a specific support ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket thread details' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('ticketId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HostSupportController.prototype, "getTicketDetails", null);
exports.HostSupportController = HostSupportController = __decorate([
    (0, swagger_1.ApiTags)('Host Support'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HOST'),
    (0, common_1.Controller)('host/support/tickets'),
    __metadata("design:paramtypes", [host_support_service_1.HostSupportService])
], HostSupportController);
//# sourceMappingURL=host-support.controller.js.map