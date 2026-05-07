import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    // Ensure the booking belongs to the user and is for this stay
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { items: true },
    });
    if (!booking || booking.userId !== userId) {
      throw new BadRequestException('Invalid booking');
    }
    if (booking.status !== 'APPROVED') {
      throw new BadRequestException('Can only review completed bookings');
    }

    const existing = await this.prisma.feedback.findFirst({
      where: { bookingId: dto.bookingId, userId },
    });
    if (existing) throw new BadRequestException('Already reviewed this booking');

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

  async findByStay(stayId: string) {
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
}
