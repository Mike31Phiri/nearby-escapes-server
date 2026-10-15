import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BlockDatesDto,
  UnblockDatesDto,
  ExperienceSlotBlockDto,
} from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // ── Property Availability (Month Grid by propertyId) ──────────────────────────

  async getPropertyAvailability(propertyId: string, year?: number, month?: number) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        stays: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        experiences: { where: { deletedAt: null } },
        transports: { where: { deletedAt: null } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');

    if (property.type === 'STAY') {
      const activeStays = property.stays.filter((s) => s.isActive);
      const draftData = (property.draftData as Record<string, any>) || {};
      const totalInventory = draftData.inventoryCount || activeStays.length || 1;

      const y = year || new Date().getFullYear();
      const m = month || new Date().getMonth() + 1;
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59);

      const stayIds = activeStays.map((s) => s.id);

      const now = new Date();

      // Active bookings via StayBooking detail records
      const stayBookings = await this.prisma.stayBooking.findMany({
        where: {
          stayId: { in: stayIds },
          checkIn: { lte: endDate },
          checkOut: { gte: startDate },
          booking: {
            OR: [
              { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
              { status: 'PENDING', expiresAt: { gt: now } },
            ],
          },
        },
        select: {
          checkIn: true,
          checkOut: true,
          booking: { select: { status: true, expiresAt: true } },
        },
      });

      // Blocked inventory units
      const blockedInventory = await this.prisma.stayInventory.findMany({
        where: { stayId: { in: stayIds }, status: 'BLOCKED' },
      });
      const blockedCount = blockedInventory.length;

      const basePrice = activeStays[0]?.rate || draftData.pricePerUnitNgwee || 100000;

      const daySlots: any[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        // Active bookings covering this date
        const dateBookings = stayBookings.filter((b) => {
          const ci = b.checkIn.toISOString().split('T')[0];
          const co = b.checkOut.toISOString().split('T')[0];
          return dateStr >= ci && dateStr < co;
        });
        const bookedCount = dateBookings.length;

        const availableCount = Math.max(0, totalInventory - bookedCount - blockedCount);
        const available = availableCount > 0;

        let status = 'available';
        if (blockedCount >= totalInventory && totalInventory > 0) {
          status = 'blocked';
        } else if (availableCount === 0) {
          status = 'booked';
        } else if (dateBookings.some((b) => b.booking.status === 'PENDING')) {
          status = 'partially_held';
        }

        daySlots.push({
          propertyId: property.id,
          propertyName: property.name,
          date: dateStr,
          totalInventory,
          bookedCount,
          blockedCount,
          availableCount,
          available,
          status,
          price: basePrice,
          priceFormatted: `K${(basePrice / 100).toFixed(2)}`,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        propertyId: property.id,
        propertyName: property.name,
        vertical: 'stay',
        totalInventory,
        year: y,
        month: m,
        days: daySlots,
      };
    }

    if (property.type === 'EXPERIENCE' && property.experiences.length > 0) {
      const exp = property.experiences[0];
      const todayStr = new Date().toISOString().split('T')[0];
      return this.getExperienceAvailability(exp.id, todayStr);
    }

    if (property.type === 'TRANSPORT' && property.transports.length > 0) {
      const trans = property.transports[0];
      const todayStr = new Date().toISOString().split('T')[0];
      return this.getTransportAvailability(trans.id, todayStr);
    }

    throw new BadRequestException('No active bookable units found for property');
  }

  // ── Stay Availability (Calendar dates & 10-min holds by stayId) ──────────────

  async getStayAvailability(stayId: string, year?: number, month?: number) {
    const stay = await this.prisma.stay.findUnique({
      where: { id: stayId },
      include: { property: true },
    });
    if (!stay) {
      // Check if ID is a propertyId fallback
      const prop = await this.prisma.property.findUnique({ where: { id: stayId } });
      if (prop) {
        return this.getPropertyAvailability(prop.id, year, month);
      }
      throw new NotFoundException('Stay unit or Property not found');
    }

    const startDate = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

    const now = new Date();

    // Query active stay bookings: CONFIRMED or PENDING with active 10-minute hold
    const stayBookings = await this.prisma.stayBooking.findMany({
      where: {
        stayId,
        checkIn: { lte: endDate },
        checkOut: { gte: startDate },
        booking: {
          OR: [
            { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            { status: 'PENDING', expiresAt: { gt: now } },
          ],
        },
      },
      select: {
        checkIn: true,
        checkOut: true,
        booking: { select: { status: true, expiresAt: true } },
      },
      orderBy: { checkIn: 'asc' },
    });

    // Blocked inventory units for this stay
    const blockedInventory = await this.prisma.stayInventory.findMany({
      where: { stayId, status: 'BLOCKED' },
    });
    const isBlocked = blockedInventory.length > 0;

    // Build availability grid day-by-day
    const daySlots: any[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Find booking covering this date
      const activeBooking = stayBookings.find((b) => {
        const ci = b.checkIn.toISOString().split('T')[0];
        const co = b.checkOut.toISOString().split('T')[0];
        return dateStr >= ci && dateStr < co;
      });

      let status = 'available';
      let available = true;
      let holdExpiresAt: string | null = null;

      if (isBlocked) {
        status = 'blocked';
        available = false;
      } else if (activeBooking) {
        if (activeBooking.booking.status === 'CONFIRMED' || activeBooking.booking.status === 'CHECKED_IN') {
          status = 'booked';
          available = false;
        } else if (activeBooking.booking.status === 'PENDING') {
          status = 'held';
          available = false;
          holdExpiresAt = activeBooking.booking.expiresAt ? activeBooking.booking.expiresAt.toISOString() : null;
        }
      }

      daySlots.push({
        stayId,
        listingId: stay.propertyId,
        propertyId: stay.propertyId,
        date: dateStr,
        available,
        status,
        holdExpiresAt,
        price: stay.rate,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return daySlots;
  }

  // Alias for backward compatibility
  async getAvailability(id: string, year?: number, month?: number) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (property) {
      return this.getPropertyAvailability(id, year, month);
    }
    return this.getStayAvailability(id, year, month);
  }

  // ── Experience Availability (Time Slots per Day & Holds) ─────────────────────

  async getExperienceAvailability(propertyOrExpId: string, dateStr: string) {
    const experience = await this.prisma.experience.findFirst({
      where: {
        OR: [{ id: propertyOrExpId }, { propertyId: propertyOrExpId }],
      },
      include: {
        slots: { where: { isActive: true }, orderBy: { startTime: 'asc' } },
        property: true,
      },
    });
    if (!experience) throw new NotFoundException('Experience not found');

    const date = new Date(dateStr);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const now = new Date();

    // Query active experience bookings on this date via ExperienceBooking
    const experienceBookings = await this.prisma.experienceBooking.findMany({
      where: {
        experienceId: experience.id,
        date: { gte: startOfDay, lte: endOfDay },
        booking: {
          OR: [
            { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            { status: 'PENDING', expiresAt: { gt: now } },
          ],
        },
      },
      select: {
        experienceSlotId: true,
        guests: true,
        booking: { select: { status: true, expiresAt: true } },
      },
    });

    const propDraftData = (experience.property.draftData as Record<string, any>) || {};
    const blockedSlotsForDate: string[] = propDraftData.blockedSlots?.[dateStr] || [];

    // Check availability for each configured ExperienceSlot
    const slots = (experience.slots || []).map((slotObj) => {
      const slotLabel = slotObj.label || `${slotObj.startTime} - ${slotObj.endTime}`;
      const maxCapacity = slotObj.maxCapacity;
      const isManuallyBlocked = blockedSlotsForDate.includes(slotObj.id) || blockedSlotsForDate.includes(slotLabel);

      const slotBookings = experienceBookings.filter((b) => b.experienceSlotId === slotObj.id);
      const bookedGuests = slotBookings.reduce((sum, b) => sum + b.guests, 0);

      const activeHold = slotBookings.find(
        (b) => b.booking.status === 'PENDING' && b.booking.expiresAt && b.booking.expiresAt > now,
      );

      const remainingSpots = Math.max(0, maxCapacity - bookedGuests);
      let available = remainingSpots > 0 && !isManuallyBlocked;

      let status = 'available';
      if (isManuallyBlocked) {
        status = 'blocked';
        available = false;
      } else if (!available) {
        status = activeHold ? 'held' : 'booked';
      } else if (activeHold) {
        status = 'partially_held';
      }

      return {
        slotId: slotObj.id,
        startTime: slotObj.startTime,
        endTime: slotObj.endTime,
        label: slotLabel,
        available,
        status,
        capacity: maxCapacity,
        bookedSpots: bookedGuests,
        remainingSpots: isManuallyBlocked ? 0 : remainingSpots,
        isBlocked: isManuallyBlocked,
        isHeld: !!activeHold,
        holdExpiresAt: activeHold?.booking.expiresAt ? activeHold.booking.expiresAt.toISOString() : null,
        price: experience.rate,
        priceFormatted: `K${(experience.rate / 100).toFixed(2)}`,
      };
    });

    const totalSlotsCount = slots.length;
    const availableSlotsCount = slots.filter((s) => s.available).length;
    const unavailableSlotsCount = totalSlotsCount - availableSlotsCount;

    return {
      experienceId: experience.id,
      propertyId: experience.propertyId,
      name: experience.name,
      date: dateStr,
      totalSlotsCount,
      availableSlotsCount,
      unavailableSlotsCount,
      slots,
    };
  }

  async blockExperienceSlot(dto: ExperienceSlotBlockDto, userId: string) {
    const id = dto.experienceId || dto.propertyId;
    if (!id) throw new BadRequestException('experienceId or propertyId is required');

    const experience = await this.prisma.experience.findFirst({
      where: { OR: [{ id }, { propertyId: id }] },
      include: { property: true },
    });
    if (!experience) throw new NotFoundException('Experience not found');

    if (experience.property.hostId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException();
    }

    const draftData = (experience.property.draftData as Record<string, any>) || {};
    const blockedSlots = draftData.blockedSlots || {};
    const currentList: string[] = blockedSlots[dto.date] || [];
    if (!currentList.includes(dto.slot)) {
      currentList.push(dto.slot);
    }
    blockedSlots[dto.date] = currentList;

    await this.prisma.property.update({
      where: { id: experience.propertyId },
      data: {
        draftData: {
          ...draftData,
          blockedSlots,
        },
      },
    });

    return {
      success: true,
      message: `Slot ${dto.slot} blocked on ${dto.date}`,
    };
  }

  async unblockExperienceSlot(dto: ExperienceSlotBlockDto, userId: string) {
    const id = dto.experienceId || dto.propertyId;
    if (!id) throw new BadRequestException('experienceId or propertyId is required');

    const experience = await this.prisma.experience.findFirst({
      where: { OR: [{ id }, { propertyId: id }] },
      include: { property: true },
    });
    if (!experience) throw new NotFoundException('Experience not found');

    if (experience.property.hostId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException();
    }

    const draftData = (experience.property.draftData as Record<string, any>) || {};
    const blockedSlots = draftData.blockedSlots || {};
    const currentList: string[] = blockedSlots[dto.date] || [];
    blockedSlots[dto.date] = currentList.filter((s) => s !== dto.slot);

    await this.prisma.property.update({
      where: { id: experience.propertyId },
      data: {
        draftData: {
          ...draftData,
          blockedSlots,
        },
      },
    });

    return {
      success: true,
      message: `Slot ${dto.slot} unblocked on ${dto.date}`,
    };
  }

  // ── Transport Availability (Seat Count or Rental Car Count) ─────────────────

  async getTransportAvailability(transportIdOrPropId: string, dateStr: string) {
    const transport = await this.prisma.transport.findFirst({
      where: {
        OR: [{ id: transportIdOrPropId }, { propertyId: transportIdOrPropId }],
      },
      include: { property: true },
    });
    if (!transport) throw new NotFoundException('Transport unit not found');

    const date = new Date(dateStr);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const now = new Date();

    // Query via TransportBooking detail records
    const transportBookings = await this.prisma.transportBooking.findMany({
      where: {
        transportId: transport.id,
        date: { gte: startOfDay, lte: endOfDay },
        booking: {
          OR: [
            { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            { status: 'PENDING', expiresAt: { gt: now } },
          ],
        },
      },
      select: {
        seats: true,
        booking: { select: { status: true, expiresAt: true } },
      },
    });

    const inventory = await this.prisma.transportInventory.findFirst({
      where: { transportId: transport.id },
    });
    const totalCapacity = inventory?.totalSeats || 50;
    const bookedSeats = transportBookings.reduce((sum, b) => sum + b.seats, 0);
    const availableSeats = Math.max(0, totalCapacity - bookedSeats);
    const available = availableSeats > 0;

    return {
      transportId: transport.id,
      propertyId: transport.propertyId,
      name: transport.name,
      vehicleType: transport.vehicleType,
      inventoryType: 'seats',
      date: dateStr,
      available,
      capacity: totalCapacity,
      totalSeats: totalCapacity,
      bookedSeats,
      remainingSeats: availableSeats,
      pricePerSeat: transport.rate,
      priceFormatted: transport.rate ? `K${(transport.rate / 100).toFixed(2)}` : 'K0.00',
    };
  }


  // ── Manual Blocking & Seasonal Pricing (Hosts) ──────────────────────────────

  private async resolveStayUnits(
    listingId?: string,
    unitId?: string,
    stayId?: string,
    userId?: string,
  ): Promise<string[]> {
    const directUnitId = unitId || stayId;
    if (directUnitId) {
      const stay = await this.prisma.stay.findUnique({
        where: { id: directUnitId },
        include: { property: true },
      });
      if (stay) {
        if (userId && stay.property.hostId !== userId) {
          const user = await this.prisma.user.findUnique({ where: { id: userId } });
          if (user?.role !== 'ADMIN') {
            throw new ForbiddenException('Only the host of this property can manage availability');
          }
        }
        return [stay.id];
      }
    }

    const propId = listingId || directUnitId;
    if (propId) {
      const property = await this.prisma.property.findUnique({
        where: { id: propId },
        include: { stays: { where: { deletedAt: null } } },
      });
      if (property) {
        if (userId && property.hostId !== userId) {
          const user = await this.prisma.user.findUnique({ where: { id: userId } });
          if (user?.role !== 'ADMIN') {
            throw new ForbiddenException('Only the host of this property can manage availability');
          }
        }
        if (property.stays.length > 0) {
          return property.stays.map((s) => s.id);
        }
      }
    }

    throw new NotFoundException('Stay unit or listing not found');
  }

  async blockDates(
    dto: BlockDatesDto | UnblockDatesDto,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const rawDto = dto as any;
    const startDateStr = rawDto.startDate || rawDto.dateFrom;
    const endDateStr = rawDto.endDate || rawDto.dateTo;
    if (!startDateStr || !endDateStr) {
      throw new BadRequestException('startDate and endDate (or dateFrom and dateTo) are required');
    }

    const stayIds = await this.resolveStayUnits(
      rawDto.propertyId || rawDto.listingId,
      rawDto.unitId,
      rawDto.stayId,
      userId,
    );

    const targetStayIds = rawDto.count && rawDto.count > 0 && rawDto.count < stayIds.length
      ? stayIds.slice(0, rawDto.count)
      : stayIds;

    for (const stayId of targetStayIds) {
      await this.prisma.stayInventory.updateMany({
        where: { stayId },
        data: { status: 'BLOCKED' },
      });
    }

    return {
      success: true,
      message: `Blocked inventory units (${targetStayIds.length} units)`,
    };
  }

  async unblockDates(
    dto: UnblockDatesDto | BlockDatesDto,
    userId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const rawDto = dto as any;
    const startDateStr = rawDto.startDate || rawDto.dateFrom;
    const endDateStr = rawDto.endDate || rawDto.dateTo;
    if (!startDateStr || !endDateStr) {
      throw new BadRequestException('startDate and endDate (or dateFrom and dateTo) are required');
    }

    const stayIds = await this.resolveStayUnits(
      rawDto.propertyId || rawDto.listingId,
      rawDto.unitId,
      rawDto.stayId,
      userId,
    );

    const targetStayIds = rawDto.count && rawDto.count > 0 && rawDto.count < stayIds.length
      ? stayIds.slice(0, rawDto.count)
      : stayIds;

    for (const stayId of targetStayIds) {
      await this.prisma.stayInventory.updateMany({
        where: { stayId },
        data: { status: 'AVAILABLE' },
      });
    }

    return {
      success: true,
      message: `Unblocked inventory units (${targetStayIds.length} units)`,
    };
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
