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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EskrowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EskrowService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const axios_1 = __importDefault(require("axios"));
let EskrowService = class EskrowService {
    static { EskrowService_1 = this; }
    config;
    prisma;
    notifications;
    logger = new common_1.Logger(EskrowService_1.name);
    static BASE_URL_SANDBOX = 'https://sandbox.eskrow.com/api/v1';
    static BASE_URL_PRODUCTION = 'https://api.eskrow.com/api/v1';
    static ENDPOINT_INITIATE = '/payment/initiate';
    static ENDPOINT_VERIFY = '/payment/verify';
    static ENDPOINT_RELEASE = '/escrow/release';
    static ENDPOINT_STATUS = '/payment/status';
    apiClient;
    webhookSecret;
    appUrl;
    constructor(config, prisma, notifications) {
        this.config = config;
        this.prisma = prisma;
        this.notifications = notifications;
        const isProduction = config.get('NODE_ENV') === 'production';
        const baseUrl = isProduction
            ? EskrowService_1.BASE_URL_PRODUCTION
            : EskrowService_1.BASE_URL_SANDBOX;
        const apiKey = config.get('ESKROW_API_KEY') || '';
        const secretKey = config.get('ESKROW_SECRET_KEY') || '';
        this.webhookSecret = config.get('ESKROW_WEBHOOK_SECRET') || '';
        this.appUrl = config.get('APP_URL') || 'http://localhost:3001';
        this.apiClient = axios_1.default.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'X-Secret-Key': secretKey,
            },
            timeout: 30_000,
        });
    }
    async createPaymentToken(user, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { bookingRef: dto.bookingRef },
        });
        if (!booking)
            throw new common_1.BadRequestException('Booking not found.');
        if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
            throw new common_1.BadRequestException('This booking has been cancelled or has expired.');
        }
        if (booking.status === 'PENDING' && booking.expiresAt && booking.expiresAt < new Date()) {
            await this.prisma.booking.update({
                where: { id: booking.id },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.BadRequestException('Your 10-minute booking hold has expired. Please start a new booking.');
        }
        const [firstName, ...lastParts] = dto.customer.name.split(' ');
        const lastName = lastParts.join(' ') || firstName;
        const callbackUrl = `${this.appUrl}/api/payments/webhook`;
        const redirectUrl = dto.callbackUrl ||
            `${this.config.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/checkout/confirmation`;
        const payload = {
            amount: dto.amount,
            currency: dto.currency || 'ZMW',
            reference: dto.bookingRef,
            description: `Booking ${dto.bookingRef} – Nearby Escapes`,
            callbackUrl,
            redirectUrl,
            customer: {
                name: `${firstName} ${lastName}`.trim(),
                email: dto.customer.email || user.email,
                phone: dto.customer.phone,
            },
        };
        try {
            const response = await this.apiClient.post(EskrowService_1.ENDPOINT_INITIATE, payload);
            const result = response.data;
            if (!result?.success || !result?.transactionId) {
                throw new Error('Eskrow did not return a valid transaction ID.');
            }
            await this.prisma.booking.update({
                where: { bookingRef: dto.bookingRef },
                data: { transToken: result.transactionId },
            });
            await this.prisma.payment.upsert({
                where: { bookingId: booking.id },
                update: { providerRef: result.transactionId, amount: dto.amount },
                create: {
                    bookingId: booking.id,
                    userId: user.id,
                    amount: dto.amount,
                    status: 'UNPAID',
                    provider: 'ESKROW',
                    providerRef: result.transactionId,
                },
            });
            return {
                success: true,
                transactionId: result.transactionId,
                paymentUrl: result.paymentUrl,
                bookingRef: dto.bookingRef,
                message: 'Payment initiated with Eskrow. Redirect the user to paymentUrl.',
            };
        }
        catch (err) {
            this.logger.error(`Eskrow initiate failed: ${err.message}`, err.response?.data);
            throw new common_1.BadRequestException(`Payment initialization failed: ${err.message}`);
        }
    }
    async verifyPayment(transactionId) {
        try {
            const response = await this.apiClient.get(`${EskrowService_1.ENDPOINT_VERIFY}/${transactionId}`);
            const result = response.data;
            const payment = await this.prisma.payment.findFirst({
                where: { providerRef: transactionId },
                include: { booking: true },
            });
            const isSuccessful = result?.status === 'SUCCESSFUL';
            if (isSuccessful && payment) {
                await this._confirmPayment(payment, transactionId);
            }
            else if (result?.status === 'FAILED' && payment) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'UNPAID' },
                });
            }
            return {
                success: isSuccessful,
                transactionId,
                status: result?.status,
                bookingRef: payment?.booking?.bookingRef || null,
            };
        }
        catch (err) {
            this.logger.error(`Eskrow verify failed: ${err.message}`, err.response?.data);
            throw new common_1.BadRequestException('Payment verification failed.');
        }
    }
    async handleWebhook(payload, signature) {
        const { transactionId, status, event } = payload;
        this.logger.log(`Eskrow webhook – event: ${event}, status: ${status}, txId: ${transactionId}`);
        const payment = await this.prisma.payment.findFirst({
            where: { providerRef: transactionId },
            include: { booking: { include: { guest: true } } },
        });
        if (!payment) {
            this.logger.warn(`No payment record for transactionId: ${transactionId}`);
            return;
        }
        const isSuccessful = status === 'SUCCESSFUL' ||
            event === 'payment.successful' ||
            event === 'funds.released';
        if (isSuccessful) {
            await this._confirmPayment(payment, transactionId);
        }
        else if (status === 'FAILED' || event === 'payment.failed') {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'UNPAID' },
            });
            this.logger.warn(`Payment ${transactionId} marked FAILED via webhook.`);
        }
    }
    async releaseEscrowFunds(bookingRef) {
        const booking = await this.prisma.booking.findUnique({
            where: { bookingRef },
            include: { payment: true },
        });
        if (!booking?.payment?.providerRef) {
            this.logger.warn(`releaseEscrowFunds: no payment providerRef for booking ${bookingRef}`);
            return;
        }
        try {
            await this.apiClient.post(EskrowService_1.ENDPOINT_RELEASE, {
                transactionId: booking.payment.providerRef,
                reference: bookingRef,
            });
            this.logger.log(`Eskrow funds released for booking ${bookingRef}`);
        }
        catch (err) {
            this.logger.error(`Eskrow release failed for ${bookingRef}: ${err.message}`, err.response?.data);
        }
    }
    async _confirmPayment(payment, transactionId) {
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'PAID' },
        });
        await this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
                expiresAt: null,
            },
        });
        if (payment.booking?.guest?.email) {
            await this.notifications.sendPaymentReceipt(payment.booking.guest.email, payment.booking.guest.name, payment.booking.bookingRef, payment.booking.totalPrice);
        }
        this.logger.log(`Payment ${transactionId} confirmed. Booking set to CONFIRMED.`);
    }
};
exports.EskrowService = EskrowService;
exports.EskrowService = EskrowService = EskrowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], EskrowService);
//# sourceMappingURL=eskrow.service.js.map