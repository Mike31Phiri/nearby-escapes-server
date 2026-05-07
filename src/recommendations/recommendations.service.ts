import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

const TAKE = 8;

@Injectable()
export class RecommendationsService {
  private zmwRate: number;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.zmwRate = Number(this.config.get('ZMW_RATE') ?? 18);
  }

  async getRecommendations(userId: string, locationOverride?: string) {
    // 0. If location override passed (e.g. from search), use it directly
    if (locationOverride) {
      const stays = await this.prisma.accommodation.findMany({
        where: {
          availableRooms: { gt: 0 },
          location: { contains: locationOverride.trim(), mode: 'insensitive' },
        },
        include: { host: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: TAKE,
      });
      if (stays.length) return Promise.all(stays.map((s) => this.toStay(s)));
    }
    // 1. Get locations from recent approved bookings
    const recentBookings = await this.prisma.booking.findMany({
      where: { userId, status: 'APPROVED' },
      include: {
        items: { include: { accommodation: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const bookedAccommodationIds = recentBookings
      .flatMap((b) => b.items.map((i) => i.accommodationId))
      .filter(Boolean) as string[];

    const bookedLocations = [
      ...new Set(
        recentBookings
          .flatMap((b) => b.items.map((i) => i.accommodation?.location))
          .filter(Boolean) as string[],
      ),
    ];

    if (bookedLocations.length) {
      // Recommend stays in the same locations, excluding already-booked ones
      const stays = await this.prisma.accommodation.findMany({
        where: {
          id: { notIn: bookedAccommodationIds },
          availableRooms: { gt: 0 },
          OR: bookedLocations.map((loc) => ({
            location: { contains: loc.split(',')[0].trim(), mode: 'insensitive' as const },
          })),
        },
        include: { host: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: TAKE,
      });

      if (stays.length) return Promise.all(stays.map((s) => this.toStay(s)));
    }

    // 2. Fall back to guest's profile location
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.location) {
      const locationCity = user.location.split(',')[0].trim();
      const stays = await this.prisma.accommodation.findMany({
        where: {
          availableRooms: { gt: 0 },
          location: { contains: locationCity, mode: 'insensitive' },
        },
        include: { host: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: TAKE,
      });

      if (stays.length) return Promise.all(stays.map((s) => this.toStay(s)));
    }

    // 3. Fall back to newest available stays
    const featured = await this.prisma.accommodation.findMany({
      where: { availableRooms: { gt: 0 } },
      include: { host: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: TAKE,
    });

    return Promise.all(featured.map((s) => this.toStay(s)));
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
      images: acc.photos?.length ? acc.photos : [],
      category: acc.category ? acc.category.charAt(0) + acc.category.slice(1).toLowerCase() : null,
      description: acc.description,
      amenities: acc.amenities ?? [],
      maxGuests: acc.maxGuests,
      availableRooms: acc.availableRooms,
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
