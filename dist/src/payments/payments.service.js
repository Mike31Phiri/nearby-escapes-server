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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const COMMISSION_RATE = 0.1;
let PaymentsService = class PaymentsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async initiate(userId, dto) {
        const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.userId !== userId)
            throw new common_1.ForbiddenException();
        if (booking.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Booking must be approved before payment');
        }
        const existing = await this.prisma.payment.findUnique({ where: { bookingId: dto.bookingId } });
        if (existing?.status === 'COMPLETED')
            throw new common_1.BadRequestException('Booking already paid');
        const amount = Number(booking.totalAmount);
        const commissionAmount = amount * COMMISSION_RATE;
        const hostAmount = amount - commissionAmount;
        const payment = await this.prisma.payment.upsert({
            where: { bookingId: dto.bookingId },
            create: {
                bookingId: dto.bookingId,
                userId,
                amount,
                commissionAmount,
                hostAmount,
                provider: 'dpo',
                providerRef: `dpo-${Date.now()}`,
                status: 'PENDING',
            },
            update: { provider: 'dpo', status: 'PENDING' },
        });
        return { payment, message: 'Payment initiated successfully with DPO' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map