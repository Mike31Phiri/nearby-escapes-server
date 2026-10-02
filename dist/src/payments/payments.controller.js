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
const eskrow_service_1 = require("./eskrow.service");
const dpo_service_1 = require("./dpo.service");
const create_token_dto_1 = require("./dto/create-token.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    eskrowService;
    dpoService;
    constructor(eskrowService, dpoService) {
        this.eskrowService = eskrowService;
        this.dpoService = dpoService;
    }
    async createToken(user, dto) {
        return this.eskrowService.createPaymentToken(user, dto);
    }
    async verifyPayment(transactionId) {
        return this.eskrowService.verifyPayment(transactionId);
    }
    async handleWebhook(payload, signature) {
        await this.eskrowService.handleWebhook(payload, signature);
        return { status: 'success' };
    }
    async initiateDpoPayment(user, dto) {
        return this.dpoService.createPaymentToken(user, dto);
    }
    async verifyDpoPayment(transToken) {
        return this.dpoService.verifyPayment(transToken);
    }
    async verifyDpoPaymentGet(transToken) {
        return this.dpoService.verifyPayment(transToken);
    }
    async handleDpoWebhook(payload) {
        await this.dpoService.handleCallback(payload);
        return { status: 'success' };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Eskrow escrow payment' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_token_dto_1.CreateTokenDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('verify/:transactionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Eskrow payment status' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Eskrow webhook/callback handler' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-eskrow-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('dpo/initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate DPO Group PayPage token' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_token_dto_1.CreateTokenDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiateDpoPayment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('dpo/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify DPO transaction status via transToken' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, common_1.Body)('transToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyDpoPayment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('dpo/verify/:transToken'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify DPO transaction status (GET alias)' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, common_1.Param)('transToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyDpoPaymentGet", null);
__decorate([
    (0, common_1.Post)('dpo/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'DPO IPN server-to-server webhook callback' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleDpoWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [eskrow_service_1.EskrowService,
        dpo_service_1.DpoService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map