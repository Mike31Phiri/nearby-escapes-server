import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const propertyId = dto.propertyId || dto.listingId;
    if (!propertyId) throw new BadRequestException('propertyId or listingId is required');

    // Verify the property exists
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

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
      where: {
        propertyId_guestId_bookingRef: {
          propertyId,
          guestId: userId,
          bookingRef: dto.bookingRef || '',
        },
      },
    });
    if (existing) throw new BadRequestException('You have already reviewed this booking');

    const review = await this.prisma.review.create({
      data: {
        propertyId,
        bookingRef: dto.bookingRef || null,
        guestId: userId,
        rating: dto.rating,
        text: dto.text || null,
      },
      include: { guest: { select: { name: true, avatar: true } } },
    });

    return this.formatReview(review);
  }

  async findByProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const reviews = await this.prisma.review.findMany({
      where: { propertyId },
      include: { guest: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.formatReview(r));
  }

  async findByListing(listingId: string) {
    return this.findByProperty(listingId);
  }

  async findByUser(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { guestId: userId },
      include: {
        guest: { select: { name: true, avatar: true } },
        property: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => ({
      ...this.formatReview(r),
      propertyName: (r as any).property?.name || null,
      listingName: (r as any).property?.name || null,
    }));
  }

  private formatReview(review: any) {
    return {
      id: review.id,
      propertyId: review.propertyId,
      listingId: review.propertyId, // backwards compatibility
      bookingRef: review.bookingRef || null,
      guestId: review.guestId,
      guestName: review.guest?.name || null,
      rating: review.rating,
      text: review.text || null,
      createdAt: review.createdAt,
    };
  }
}
