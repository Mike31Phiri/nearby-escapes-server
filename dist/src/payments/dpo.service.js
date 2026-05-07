"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DpoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DpoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let DpoService = DpoService_1 = class DpoService {
    config;
    prisma;
    notifications;
    logger = new common_1.Logger(DpoService_1.name);
    dpoBaseUrl;
    serviceCode;
    returnUrl;
    securityHash;
    constructor(config, prisma, notifications) {
        this.config = config;
        this.prisma = prisma;
        this.notifications = notifications;
        this.dpoBaseUrl = config.get('DPO_BASE_URL') ?? 'https://secure.3gdirectpay.com';
        this.serviceCode = config.get('DPO_SERVICE_CODE') ?? '';
        this.returnUrl = config.get('DPO_RETURN_URL') ?? '';
        this.securityHash = config.get('DPO_SECURITY_HASH') ?? '';
    }
    async initiatePayment(amount, userId, bookingId, currency = 'ZMW') {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
            throw new Error('Booking not found');
        }
        if (booking.userId !== userId) {
            throw new Error('Unauthorized: User does not own this booking');
        }
        const transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const commissionAmount = amount * 0.1;
        const hostAmount = amount - commissionAmount;
        await this.prisma.payment.create({
            data: {
                bookingId,
                userId,
                amount: new Number(amount).toString(),
                commissionAmount: new Number(commissionAmount).toString(),
                hostAmount: new Number(hostAmount).toString(),
                provider: 'dpo',
                providerRef: transactionReference,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        const formattedAmount = amount.toFixed(2);
        const checkoutUrl = `${this.dpoBaseUrl}/pay.asp?ID=${this.serviceCode}`;
        const paymentSession = {
            transactionId: transactionReference,
            userId,
            bookingId,
            amount: formattedAmount,
            currency,
            timestamp: Date.now(),
        };
        return {
            transactionId: transactionReference,
            checkoutUrl,
        };
    }
    async handleCallback(payload) {
        const { transaction_reference, status, provider_ref } = payload;
        if (!transaction_reference || !status) {
            throw new Error('Invalid DPO callback payload');
        }
        if (payload.security_hash) {
            const payloadCopy = { ...payload };
            const receivedHash = payloadCopy.security_hash;
            delete payloadCopy.security_hash;
            const valuesString = Object.values(payloadCopy).join('');
            const calculatedHash = crypto
                .createHmac('sha1', this.securityHash)
                .update(valuesString)
                .digest('hex');
            if (calculatedHash !== receivedHash) {
                this.logger.error('Security hash mismatch in DPO callback');
                throw new Error('Security hash mismatch');
            }
        }
        const payment = await this.prisma.payment.findFirst({
            where: {
                providerRef: transaction_reference,
                provider: 'dpo',
            },
            include: {
                booking: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!payment) {
            this.logger.error(`Payment not found for transaction reference: ${transaction_reference}`);
            throw new Error(`Payment not found for transaction reference: ${transaction_reference}`);
        }
        const newStatus = status === 'SUCCESSFUL' ? client_1.PaymentStatus.COMPLETED : client_1.PaymentStatus.FAILED;
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: newStatus,
                    providerRef: provider_ref || payment.providerRef,
                },
            });
            if (newStatus === client_1.PaymentStatus.COMPLETED) {
                await tx.booking.update({
                    where: { id: payment.bookingId },
                    data: { status: 'APPROVED' },
                });
                await this.notifications.sendPaymentReceipt(payment.booking.user.email, payment.booking.user.firstName, payment.bookingId, Number(payment.amount));
            }
        });
        this.logger.log(`Payment status updated to ${newStatus} for transaction: ${transaction_reference}`);
    }
    async validateTransaction(transactionId) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                providerRef: transactionId,
                provider: 'dpo',
            },
        });
        if (!payment) {
            throw new Error(`Payment not found for transaction ID: ${transactionId}`);
        }
        return payment;
    }
};
exports.DpoService = DpoService;
exports.DpoService = DpoService = DpoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], DpoService);
//# sourceMappingURL=dpo.service.js.map