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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const listing = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (dto.bookingRef) {
            const booking = await this.prisma.booking.findUnique({ where: { bookingRef: dto.bookingRef } });
            if (!booking)
                throw new common_1.NotFoundException('Booking not found');
            if (booking.guestId !== userId)
                throw new common_1.BadRequestException('This booking is not yours');
            if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED') {
                throw new common_1.BadRequestException('Can only review completed bookings');
            }
        }
        const existing = await this.prisma.review.findUnique({
            where: { listingId_guestId_bookingRef: { listingId: dto.listingId, guestId: userId, bookingRef: dto.bookingRef || '' } },
        });
        if (existing)
            throw new common_1.BadRequestException('You have already reviewed this booking');
        const review = await this.prisma.review.create({
            data: {
                listingId: dto.listingId,
                bookingRef: dto.bookingRef || null,
                guestId: userId,
                rating: dto.rating,
                text: dto.text || null,
            },
            include: { guest: { select: { name: true, avatar: true } } },
        });
        return this.formatReview(review);
    }
    async findByListing(listingId) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        const reviews = await this.prisma.review.findMany({
            where: { listingId },
            include: { guest: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return reviews.map((r) => this.formatReview(r));
    }
    async findByUser(userId) {
        const reviews = await this.prisma.review.findMany({
            where: { guestId: userId },
            include: {
                guest: { select: { name: true, avatar: true } },
                listing: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return reviews.map((r) => ({
            ...this.formatReview(r),
            listingName: r.listing?.name || null,
        }));
    }
    formatReview(review) {
        return {
            id: review.id,
            listingId: review.listingId,
            bookingRef: review.bookingRef || null,
            guestId: review.guestId,
            guestName: review.guest?.name || null,
            rating: review.rating,
            text: review.text || null,
            createdAt: review.createdAt,
        };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map