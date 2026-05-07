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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dpo_service_1 = require("./dpo.service");
const payment_intent_dto_1 = require("./dto/payment-intent.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    dpoService;
    constructor(dpoService) {
        this.dpoService = dpoService;
    }
    async createIntent(user, dto) {
        const { transactionId, checkoutUrl } = await this.dpoService.initiatePayment(dto.amount, user.id, dto.bookingId, dto.currency);
        return { intentId: transactionId, checkoutUrl, status: 'pending' };
    }
    async handleDpoWebhook(req) {
        await this.dpoService.handleCallback(req.body);
        return { status: 'success' };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('TRAVELER'),
    (0, common_1.Post)('intent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate payment — returns DPO checkout URL' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_intent_dto_1.PaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Post)('dpo-webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Header)('Content-Type', 'application/json'),
    (0, swagger_1.ApiOperation)({ summary: 'DPO payment webhook handler' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleDpoWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [dpo_service_1.DpoService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map