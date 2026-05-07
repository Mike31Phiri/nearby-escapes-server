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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedbackService = class FeedbackService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: { items: true },
        });
        if (!booking || booking.userId !== userId) {
            throw new common_1.BadRequestException('Invalid booking');
        }
        if (booking.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Can only review completed bookings');
        }
        const existing = await this.prisma.feedback.findFirst({
            where: { bookingId: dto.bookingId, userId },
        });
        if (existing)
            throw new common_1.BadRequestException('Already reviewed this booking');
        const feedback = await this.prisma.feedback.create({
            data: { stayId: dto.stayId, bookingId: dto.bookingId, userId, rating: dto.rating, comment: dto.comment },
            include: { user: { select: { firstName: true, lastName: true } } },
        });
        return {
            id: feedback.id,
            stayId: feedback.stayId,
            bookingId: feedback.bookingId,
            rating: feedback.rating,
            comment: feedback.comment ?? null,
            authorName: `${feedback.user.firstName} ${feedback.user.lastName}`.trim(),
            createdAt: feedback.createdAt,
        };
    }
    async findByStay(stayId) {
        const feedbacks = await this.prisma.feedback.findMany({
            where: { stayId },
            include: { user: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return feedbacks.map((f) => ({
            id: f.id,
            stayId: f.stayId,
            bookingId: f.bookingId,
            rating: f.rating,
            comment: f.comment ?? null,
            authorName: `${f.user.firstName} ${f.user.lastName}`.trim(),
            createdAt: f.createdAt,
        }));
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map