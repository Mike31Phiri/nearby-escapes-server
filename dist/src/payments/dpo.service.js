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
var DpoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DpoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const axios_1 = __importDefault(require("axios"));
let DpoService = DpoService_1 = class DpoService {
    config;
    prisma;
    notifications;
    logger = new common_1.Logger(DpoService_1.name);
    dpoApiUrl;
    companyToken;
    serviceTypeId;
    constructor(config, prisma, notifications) {
        this.config = config;
        this.prisma = prisma;
        this.notifications = notifications;
        this.dpoApiUrl = 'https://secure.directpay.online/directtrade/TPG';
        this.companyToken = config.get('DPO_COMPANY_TOKEN') || '';
        this.serviceTypeId = config.get('DPO_SERVICE_TYPE_ID') || '6666';
    }
    async createPaymentToken(user, dto) {
        const callbackUrl = dto.callbackUrl || `${this.config.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/checkout/confirmation`;
        const [firstName, ...lastNameParts] = dto.customer.name.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        const payload = {
            companyToken: this.companyToken,
            accountType: 'GENERAL',
            transaction: {
                paymentAmount: (dto.amount / 100).toFixed(2),
                paymentCurrency: dto.currency || 'ZMW',
                companyRef: dto.bookingRef,
                customerFirstName: firstName,
                customerLastName: lastName,
                customerPhone: dto.customer.phone,
                customerEmail: dto.customer.email || user.email,
                serviceTypeId: this.serviceTypeId,
                redirectURL: callbackUrl,
                backURL: callbackUrl,
            },
        };
        try {
            const response = await axios_1.default.post(`${this.dpoApiUrl}/createToken`, payload);
            const result = response.data;
            if (result?.transToken) {
                const booking = await this.prisma.booking.findUnique({ where: { bookingRef: dto.bookingRef } });
                if (!booking)
                    throw new common_1.BadRequestException('Booking not found');
                if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
                    throw new common_1.BadRequestException('This booking has been cancelled or has expired.');
                }
                if (booking.status === 'PENDING' && booking.expiresAt && booking.expiresAt < new Date()) {
                    await this.prisma.booking.update({
                        where: { id: booking.id },
                        data: { status: 'EXPIRED' },
                    });
                    throw new common_1.BadRequestException('Your 10-minute booking hold has expired. Please initiate a new booking.');
                }
                await this.prisma.booking.update({
                    where: { bookingRef: dto.bookingRef },
                    data: { transToken: result.transToken },
                });
                await this.prisma.payment.upsert({
                    where: { bookingId: booking.id },
                    update: { providerRef: result.transToken, amount: dto.amount },
                    create: {
                        bookingId: booking.id,
                        userId: user.id,
                        amount: dto.amount,
                        status: 'UNPAID',
                        provider: 'DPO',
                        providerRef: result.transToken,
                    },
                });
                return {
                    success: true,
                    transToken: result.transToken,
                    paymentUrl: `https://secure.directpay.online/pay/${result.transToken}`,
                    bookingRef: dto.bookingRef,
                    message: 'Payment token created successfully.',
                };
            }
            throw new Error(result?.result || 'Failed to create DPO payment token');
        }
        catch (err) {
            this.logger.error(`DPO token creation failed: ${err.message}`);
            throw new common_1.BadRequestException(`Payment initialization failed: ${err.message}`);
        }
    }
    async verifyPayment(transToken) {
        try {
            const response = await axios_1.default.post(`${this.dpoApiUrl}/verifyToken`, {
                companyToken: this.companyToken,
                transToken,
            });
            const result = response.data;
            const payment = await this.prisma.payment.findFirst({
                where: { providerRef: transToken },
                include: { booking: true },
            });
            let status = 'pending';
            if (result?.result === '000' || result?.transactionStatus === 'SUCCESSFUL') {
                status = 'completed';
                if (payment) {
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
                    if (payment.booking) {
                        const guest = await this.prisma.user.findUnique({ where: { id: payment.userId } });
                        if (guest) {
                            await this.notifications.sendPaymentReceipt(guest.email, guest.name, payment.booking.bookingRef, payment.amount);
                        }
                    }
                }
            }
            else if (result?.result !== '000') {
                status = 'failed';
            }
            return {
                success: status === 'completed',
                transToken,
                status,
                bookingRef: payment?.booking?.bookingRef || null,
                ...result,
            };
        }
        catch (err) {
            this.logger.error(`DPO verification failed: ${err.message}`);
            throw new common_1.BadRequestException('Payment verification failed');
        }
    }
    async handleCallback(payload) {
        const { transToken, status } = payload;
        if (!transToken)
            throw new common_1.BadRequestException('Invalid webhook payload');
        const payment = await this.prisma.payment.findFirst({
            where: { providerRef: transToken },
            include: { booking: { include: { guest: true } } },
        });
        if (!payment) {
            this.logger.error(`Payment not found for token: ${transToken}`);
            return;
        }
        const isSuccessful = status === 'SUCCESSFUL' || status === '000';
        const newStatus = isSuccessful ? 'PAID' : 'UNPAID';
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: newStatus },
        });
        if (isSuccessful) {
            await this.prisma.booking.update({
                where: { id: payment.bookingId },
                data: {
                    paymentStatus: 'PAID',
                    status: 'CONFIRMED',
                    expiresAt: null,
                },
            });
            if (payment.booking?.guest?.email) {
                await this.notifications.sendPaymentReceipt(payment.booking.guest.email, payment.booking.guest.name, payment.booking.bookingRef, payment.amount);
            }
        }
        this.logger.log(`Payment ${transToken} updated to ${newStatus}`);
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