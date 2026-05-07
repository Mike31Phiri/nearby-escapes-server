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
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let ApiController = class ApiController {
    getAllEndpoints() {
        return {
            auth: [
                { method: 'POST', path: '/api/auth/register', auth: false },
                { method: 'POST', path: '/api/auth/login', auth: false },
                { method: 'POST', path: '/api/auth/logout', auth: false },
                { method: 'GET', path: '/api/auth/session', auth: true },
                { method: 'POST', path: '/api/auth/forgot-password', auth: false },
                { method: 'POST', path: '/api/auth/reset-password', auth: false },
            ],
            users: [
                { method: 'GET', path: '/api/users/me', auth: true },
                { method: 'PATCH', path: '/api/users/me', auth: true },
            ],
            stays: [
                { method: 'GET', path: '/api/stays', auth: false, query: ['q', 'location', 'minPrice', 'maxPrice'] },
                { method: 'GET', path: '/api/stays/:id', auth: false },
                { method: 'GET', path: '/api/stays/:id/feedback', auth: false },
            ],
            bookings: [
                { method: 'POST', path: '/api/bookings', auth: true },
                { method: 'GET', path: '/api/bookings', auth: true },
                { method: 'GET', path: '/api/bookings/:id', auth: true },
                { method: 'PATCH', path: '/api/bookings/:id/cancel', auth: true },
                { method: 'GET', path: '/api/bookings/host/all', auth: true, roles: ['HOST'] },
                { method: 'POST', path: '/api/bookings/:id/approve', auth: true, roles: ['HOST'] },
                { method: 'POST', path: '/api/bookings/:id/reject', auth: true, roles: ['HOST'] },
                { method: 'POST', path: '/api/bookings/approve-by-token/:token', auth: false },
                { method: 'POST', path: '/api/bookings/reject-by-token/:token', auth: false },
            ],
            payments: [
                { method: 'POST', path: '/api/payments/intent', auth: true, roles: ['TRAVELER'] },
                { method: 'POST', path: '/api/payments/dpo-webhook', auth: false },
            ],
            host: [
                { method: 'GET', path: '/api/host/dashboard', auth: true, roles: ['HOST'] },
                { method: 'GET', path: '/api/host/earnings', auth: true, roles: ['HOST'] },
                { method: 'GET', path: '/api/host/calendar/:id', auth: true, roles: ['HOST'] },
                { method: 'GET', path: '/api/host/listings', auth: true, roles: ['HOST'] },
                { method: 'POST', path: '/api/host/listings', auth: true, roles: ['HOST'] },
                { method: 'PATCH', path: '/api/host/listings/:id', auth: true, roles: ['HOST'] },
                { method: 'DELETE', path: '/api/host/listings/:id', auth: true, roles: ['HOST'] },
            ],
            collections: [
                { method: 'GET', path: '/api/collections', auth: true },
                { method: 'POST', path: '/api/collections', auth: true },
                { method: 'PATCH', path: '/api/collections/:id', auth: true },
                { method: 'DELETE', path: '/api/collections/:id', auth: true },
                { method: 'GET', path: '/api/collections/:slug', auth: false },
            ],
            feedback: [
                { method: 'POST', path: '/api/feedback', auth: true },
                { method: 'GET', path: '/api/stays/:id/feedback', auth: false },
            ],
            inbox: [
                { method: 'GET', path: '/api/inbox/threads', auth: true },
                { method: 'POST', path: '/api/inbox/threads', auth: true },
                { method: 'GET', path: '/api/inbox/threads/:id/messages', auth: true },
                { method: 'POST', path: '/api/inbox/threads/:id/messages', auth: true },
            ],
            hosts: [
                { method: 'POST', path: '/api/hosts', auth: true },
                { method: 'GET', path: '/api/hosts/me', auth: true },
                { method: 'GET', path: '/api/hosts/:id', auth: false },
            ],
            accommodations: [
                { method: 'GET', path: '/api/accommodations', auth: false },
                { method: 'GET', path: '/api/accommodations/:id', auth: false },
                { method: 'POST', path: '/api/accommodations', auth: true, roles: ['HOST'] },
                { method: 'PATCH', path: '/api/accommodations/:id', auth: true, roles: ['HOST'] },
                { method: 'DELETE', path: '/api/accommodations/:id', auth: true, roles: ['HOST'] },
            ],
            buses: [
                { method: 'GET', path: '/api/buses', auth: false },
                { method: 'GET', path: '/api/buses/:id', auth: false },
                { method: 'POST', path: '/api/buses', auth: true, roles: ['HOST'] },
                { method: 'PATCH', path: '/api/buses/:id', auth: true, roles: ['HOST'] },
                { method: 'DELETE', path: '/api/buses/:id', auth: true, roles: ['HOST'] },
            ],
            attractions: [
                { method: 'GET', path: '/api/attractions', auth: false },
                { method: 'GET', path: '/api/attractions/:id', auth: false },
                { method: 'POST', path: '/api/attractions', auth: true, roles: ['HOST'] },
                { method: 'PATCH', path: '/api/attractions/:id', auth: true, roles: ['HOST'] },
                { method: 'DELETE', path: '/api/attractions/:id', auth: true, roles: ['HOST'] },
            ],
            packages: [
                { method: 'GET', path: '/api/packages', auth: false },
                { method: 'GET', path: '/api/packages/:id', auth: false },
                { method: 'POST', path: '/api/packages', auth: true, roles: ['HOST'] },
                { method: 'PATCH', path: '/api/packages/:id', auth: true, roles: ['HOST'] },
                { method: 'DELETE', path: '/api/packages/:id', auth: true, roles: ['HOST'] },
            ],
            popular: [
                { method: 'GET', path: '/api/popular/accommodations', auth: false },
                { method: 'GET', path: '/api/popular/buses', auth: false },
                { method: 'GET', path: '/api/popular/attractions', auth: false },
                { method: 'GET', path: '/api/popular/packages', auth: false },
                { method: 'POST', path: '/api/popular/sync', auth: true, roles: ['ADMIN'] },
            ],
            uploads: [
                { method: 'POST', path: '/api/uploads', auth: true, roles: ['HOST'] },
                { method: 'DELETE', path: '/api/uploads/:key', auth: true, roles: ['HOST'] },
            ],
            recommendations: [
                { method: 'GET', path: '/api/recommendations', auth: true },
            ],
            admin: [
                { method: 'GET', path: '/api/admin/dashboard', auth: true, roles: ['ADMIN'] },
                { method: 'GET', path: '/api/admin/analytics/bookings', auth: true, roles: ['ADMIN'] },
                { method: 'GET', path: '/api/admin/analytics/payments', auth: true, roles: ['ADMIN'] },
                { method: 'GET', path: '/api/admin/commissions', auth: true, roles: ['ADMIN'] },
                { method: 'GET', path: '/api/admin/payouts', auth: true, roles: ['ADMIN'] },
                { method: 'PATCH', path: '/api/admin/payouts/:id/paid', auth: true, roles: ['ADMIN'] },
                { method: 'GET', path: '/api/admin/users', auth: true, roles: ['ADMIN'] },
                { method: 'GET', path: '/api/admin/bookings', auth: true, roles: ['ADMIN'] },
                { method: 'PATCH', path: '/api/admin/hosts/:id/approve', auth: true, roles: ['ADMIN'] },
                { method: 'PATCH', path: '/api/admin/users/:id/promote-admin', auth: true, roles: ['ADMIN'] },
            ],
        };
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Get)('endpoints'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available API endpoints grouped by resource' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getAllEndpoints", null);
exports.ApiController = ApiController = __decorate([
    (0, swagger_1.ApiTags)('API'),
    (0, common_1.Controller)('api')
], ApiController);
//# sourceMappingURL=api.controller.js.map