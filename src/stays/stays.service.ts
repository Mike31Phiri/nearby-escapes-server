import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaysService {
  private zmwRate: number;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.zmwRate = Number(this.config.get('ZMW_RATE') ?? 18);
  }

  async findAll(q?: string, location?: string, minPrice?: number, maxPrice?: number) {
    const where: any = {};
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerNight = {};
      if (minPrice !== undefined) where.pricePerNight.gte = minPrice;
      if (maxPrice !== undefined) where.pricePerNight.lte = maxPrice;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    const accommodations = await this.prisma.accommodation.findMany({
      where,
      include: {
        host: { include: { user: true } },
        _count: { select: { bookingItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(accommodations.map((acc) => this.toStay(acc)));
  }

  async findOne(id: string) {
    const acc = await this.prisma.accommodation.findUnique({
      where: { id },
      include: {
        host: { include: { user: true } },
        _count: { select: { bookingItems: true } },
      },
    });
    if (!acc) throw new NotFoundException('Stay not found');
    return this.toStay(acc);
  }

  private async toStay(acc: any) {
    const feedbacks = await this.prisma.feedback.aggregate({
      where: { stayId: acc.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const price = Number(acc.pricePerNight);
    const host = acc.host;

    return {
      id: acc.id,
      name: acc.name,
      location: acc.location,
      price,
      priceZmw: Math.round(price * this.zmwRate),
      rating: Number((feedbacks._avg.rating ?? 0).toFixed(1)),
      reviews: feedbacks._count.rating,
      image: acc.photos?.[0] ?? null,
      images: acc.photos?.length ? acc.photos : (acc.photos?.[0] ? [acc.photos[0]] : []),
      category: acc.category ? acc.category.charAt(0) + acc.category.slice(1).toLowerCase() : null,
      description: acc.description,
      amenities: acc.amenities ?? [],
      maxGuests: acc.maxGuests,
      availableRooms: acc.availableRooms,
      totalRooms: acc.totalRooms,
      cancellationPolicy: acc.cancellationPolicy,
      host: host ? {
        id: host.id,
        displayName: `${host.user.firstName} ${host.user.lastName}`.trim(),
        avatarUrl: host.user.avatarUrl ?? null,
        location: host.user.location ?? null,
        verified: host.isApproved,
      } : null,
    };
  }
}
