import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Verify the listing exists
    const listing = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    // If bookingRef provided, verify the user has a completed booking
    if (dto.bookingRef) {
      const booking = await this.prisma.booking.findUnique({ where: { bookingRef: dto.bookingRef } });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.guestId !== userId) throw new BadRequestException('This booking is not yours');
      if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED') {
        throw new BadRequestException('Can only review completed bookings');
      }
    }

    // Check for duplicate review
    const existing = await this.prisma.review.findUnique({
      where: { listingId_guestId_bookingRef: { listingId: dto.listingId, guestId: userId, bookingRef: dto.bookingRef || '' } },
    });
    if (existing) throw new BadRequestException('You have already reviewed this booking');

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

  async findByListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const reviews = await this.prisma.review.findMany({
      where: { listingId },
      include: { guest: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.formatReview(r));
  }

  async findByUser(userId: string) {
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
      listingName: (r as any).listing?.name || null,
    }));
  }

  private formatReview(review: any) {
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
}
