import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockDatesDto, SeasonalPricingDto } from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(listingId: string, year?: number, month?: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const startDate = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

    const slots = await this.prisma.availabilitySlot.findMany({
      where: {
        listingId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get bookings for this listing in the date range
    const bookings = await this.prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { checkIn: { lte: endDate }, checkOut: { gte: startDate } },
          { date: { gte: startDate, lte: endDate } },
        ],
      },
    });

    // Build availability grid
    const daySlots: any[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingSlot = slots.find(
        (s) => s.date.toISOString().split('T')[0] === dateStr,
      );
      const isBooked = bookings.some((b) => {
        if (b.checkIn && b.checkOut) {
          const ci = b.checkIn.toISOString().split('T')[0];
          const co = b.checkOut.toISOString().split('T')[0];
          return dateStr >= ci && dateStr < co;
        }
        if (b.date) {
          return b.date.toISOString().split('T')[0] === dateStr;
        }
        return false;
      });

      daySlots.push({
        listingId,
        date: dateStr,
        status: isBooked ? 'booked' : existingSlot?.status || 'available',
        price: existingSlot?.price || null,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return daySlots;
  }

  async blockDates(dto: BlockDatesDto, userId: string) {
    await this.assertListingOwnership(dto.listingId, userId);
    const start = new Date(dto.dateFrom);
    const end = new Date(dto.dateTo);

    const current = new Date(start);
    while (current <= end) {
      const slotDate = new Date(current);
      await this.prisma.availabilitySlot.upsert({
        where: { listingId_date: { listingId: dto.listingId, date: slotDate } },
        update: { status: 'blocked' },
        create: {
          listingId: dto.listingId,
          date: slotDate,
          status: 'blocked',
        },
      });
      current.setDate(current.getDate() + 1);
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return { message: `Blocked ${totalDays} days from ${dto.dateFrom} to ${dto.dateTo}` };
  }

  async unblockDates(dto: BlockDatesDto, userId: string) {
    await this.assertListingOwnership(dto.listingId, userId);
    const start = new Date(dto.dateFrom);
    const end = new Date(dto.dateTo);

    const deleted = await this.prisma.availabilitySlot.deleteMany({
      where: {
        listingId: dto.listingId,
        date: { gte: start, lte: end },
        status: 'blocked',
      },
    });

    return { message: `Unblocked ${deleted.count} days` };
  }

  async addSeasonalPricing(dto: SeasonalPricingDto, userId: string) {
    await this.assertListingOwnership(dto.listingId, userId);
    return this.prisma.seasonalPricing.create({
      data: {
        listingId: dto.listingId,
        from: new Date(dto.from),
        to: new Date(dto.to),
        price: dto.price,
        label: dto.label || null,
      },
    });
  }

  async removeSeasonalPricing(id: string, userId: string) {
    const pricing = await this.prisma.seasonalPricing.findUnique({ where: { id } });
    if (!pricing) throw new NotFoundException('Seasonal pricing not found');
    await this.assertListingOwnership(pricing.listingId, userId);
    return this.prisma.seasonalPricing.delete({ where: { id } });
  }

  private async assertListingOwnership(listingId: string, userId: string) {
    const host = await this.prisma.host.findUnique({ where: { userId } });
    if (!host) throw new NotFoundException('Host not found');
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.hostId !== host.id) throw new NotFoundException('Listing not found');
  }
}
