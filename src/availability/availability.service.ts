import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockDatesDto, SeasonalPricingDto } from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // ── Stay Availability (Calendar dates & 10-min holds) ────────────────────────

  async getStayAvailability(stayId: string, year?: number, month?: number) {
    const stay = await this.prisma.stay.findUnique({
      where: { id: stayId },
      include: { property: true },
    });
    if (!stay) throw new NotFoundException('Stay unit not found');

    const startDate = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

    // Host manually blocked slots
    const slots = await this.prisma.availabilitySlot.findMany({
      where: {
        stayId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const now = new Date();

    // Query active bookings: CONFIRMED or PENDING with active 10-minute hold
    const bookings = await this.prisma.booking.findMany({
      where: {
        stayId,
        OR: [
          { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
          { status: 'PENDING', expiresAt: { gt: now } },
        ],
        AND: [
          { checkIn: { lte: endDate } },
          { checkOut: { gte: startDate } },
        ],
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        expiresAt: true,
      },
    });

    // Build availability grid day-by-day
    const daySlots: any[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingSlot = slots.find(
        (s) => s.date.toISOString().split('T')[0] === dateStr,
      );

      // Find booking covering this date
      const activeBooking = bookings.find((b) => {
        if (!b.checkIn || !b.checkOut) return false;
        const ci = b.checkIn.toISOString().split('T')[0];
        const co = b.checkOut.toISOString().split('T')[0];
        return dateStr >= ci && dateStr < co;
      });

      let status = 'available';
      let available = true;
      let holdExpiresAt: string | null = null;

      if (existingSlot?.status === 'blocked') {
        status = 'blocked';
        available = false;
      } else if (activeBooking) {
        if (activeBooking.status === 'CONFIRMED' || activeBooking.status === 'CHECKED_IN') {
          status = 'booked';
          available = false;
        } else if (activeBooking.status === 'PENDING') {
          status = 'held';
          available = false;
          holdExpiresAt = activeBooking.expiresAt ? activeBooking.expiresAt.toISOString() : null;
        }
      }

      daySlots.push({
        stayId,
        listingId: stayId, // backwards compatibility
        propertyId: stay.propertyId,
        date: dateStr,
        available,
        status,
        holdExpiresAt,
        price: existingSlot?.price || stay.price,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return daySlots;
  }

  // Alias for backward compatibility
  async getAvailability(stayId: string, year?: number, month?: number) {
    return this.getStayAvailability(stayId, year, month);
  }

  // ── Experience Availability (Time Slots & 10-min holds) ─────────────────────

  async getExperienceAvailability(experienceId: string, dateStr: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id: experienceId },
      include: {
        timeSlots: { orderBy: { slot: 'asc' } },
        property: true,
      },
    });
    if (!experience) throw new NotFoundException('Experience unit not found');

    const date = new Date(dateStr);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const now = new Date();

    // Query active bookings for this experience on this date: CONFIRMED or PENDING active hold
    const bookings = await this.prisma.booking.findMany({
      where: {
        experienceId,
        date: { gte: startOfDay, lte: endOfDay },
        OR: [
          { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
          { status: 'PENDING', expiresAt: { gt: now } },
        ],
      },
      select: {
        id: true,
        timeSlot: true,
        guests: true,
        status: true,
        expiresAt: true,
      },
    });

    const maxCapacity = experience.maxParticipants || 1;

    // Check availability for each configured time slot
    const slots = (experience.timeSlots || []).map((slotObj) => {
      const slotName = slotObj.slot;

      // Find all bookings occupying this slot
      const slotBookings = bookings.filter((b) => b.timeSlot === slotName);
      const bookedGuests = slotBookings.reduce((sum, b) => sum + b.guests, 0);

      // Check if there is an active 10-minute hold on this slot
      const activeHold = slotBookings.find(
        (b) => b.status === 'PENDING' && b.expiresAt && b.expiresAt > now,
      );

      const remainingSpots = Math.max(0, maxCapacity - bookedGuests);
      const available = remainingSpots > 0;

      let status = 'available';
      if (!available) {
        status = activeHold ? 'held' : 'booked';
      } else if (activeHold) {
        status = 'partially_held';
      }

      return {
        slot: slotName,
        available,
        status,
        capacity: maxCapacity,
        bookedSpots: bookedGuests,
        remainingSpots,
        isHeld: !!activeHold,
        holdExpiresAt: activeHold?.expiresAt ? activeHold.expiresAt.toISOString() : null,
        price: experience.price,
        priceFormatted: `K${(experience.price / 100).toFixed(2)}`,
      };
    });

    return {
      experienceId: experience.id,
      propertyId: experience.propertyId,
      name: experience.name,
      date: dateStr,
      slots,
    };
  }

  // ── Transport Availability (Seats & 10-min holds) ───────────────────────────

  async getTransportAvailability(transportId: string, dateStr: string) {
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
      include: { property: true },
    });
    if (!transport) throw new NotFoundException('Transport unit not found');

    const date = new Date(dateStr);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        transportId,
        date: { gte: startOfDay, lte: endOfDay },
        OR: [
          { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
          { status: 'PENDING', expiresAt: { gt: now } },
        ],
      },
      select: {
        id: true,
        guests: true,
        status: true,
        expiresAt: true,
      },
    });

    const totalCapacity = transport.capacity || 50;
    const bookedSeats = bookings.reduce((sum, b) => sum + b.guests, 0);
    const remainingSeats = Math.max(0, totalCapacity - bookedSeats);
    const available = remainingSeats > 0;

    return {
      transportId: transport.id,
      propertyId: transport.propertyId,
      name: transport.name,
      date: dateStr,
      available,
      capacity: totalCapacity,
      bookedSeats,
      remainingSeats,
      pricePerSeat: transport.pricePerSeat,
      priceFormatted: transport.pricePerSeat ? `K${(transport.pricePerSeat / 100).toFixed(2)}` : 'K0.00',
      schedule: transport.schedule,
    };
  }

  // ── Manual Blocking & Seasonal Pricing (Hosts) ──────────────────────────────

  async blockDates(dto: BlockDatesDto, userId: string) {
    const stayId = dto.stayId || dto.listingId;
    if (!stayId) throw new BadRequestException('stayId (or listingId) is required');

    await this.assertStayOwnership(stayId, userId);
    const start = new Date(dto.dateFrom);
    const end = new Date(dto.dateTo);

    const current = new Date(start);
    while (current <= end) {
      const slotDate = new Date(current);
      await this.prisma.availabilitySlot.upsert({
        where: { stayId_date: { stayId, date: slotDate } },
        update: { status: 'blocked' },
        create: {
          stayId,
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
    const stayId = dto.stayId || dto.listingId;
    if (!stayId) throw new BadRequestException('stayId (or listingId) is required');

    await this.assertStayOwnership(stayId, userId);
    const start = new Date(dto.dateFrom);
    const end = new Date(dto.dateTo);

    const deleted = await this.prisma.availabilitySlot.deleteMany({
      where: {
        stayId,
        date: { gte: start, lte: end },
        status: 'blocked',
      },
    });

    return { message: `Unblocked ${deleted.count} days` };
  }

  async addSeasonalPricing(dto: SeasonalPricingDto, userId: string) {
    const stayId = dto.stayId || dto.listingId;
    if (!stayId) throw new BadRequestException('stayId (or listingId) is required');

    await this.assertStayOwnership(stayId, userId);
    return this.prisma.seasonalPricing.create({
      data: {
        stayId,
        from: new Date(dto.from),
        to: new Date(dto.to),
        price: dto.price,
        label: dto.label || null,
      },
    });
  }

  async removeSeasonalPricing(id: string, userId: string) {
    const pricing = await this.prisma.seasonalPricing.findUnique({
      where: { id },
      include: { stay: { include: { property: true } } },
    });
    if (!pricing) throw new NotFoundException('Seasonal pricing not found');
    await this.assertStayOwnership(pricing.stayId, userId);
    return this.prisma.seasonalPricing.delete({ where: { id } });
  }

  private async assertStayOwnership(stayId: string, userId: string) {
    const stay = await this.prisma.stay.findUnique({
      where: { id: stayId },
      include: { property: true },
    });
    if (!stay || stay.property.hostId !== userId) {
      throw new NotFoundException('Stay unit not found');
    }
    return stay;
  }
}
