import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  GuestBookingItemDto,
  GuestBookingsGroupedDto,
  GetGuestBookingsQueryDto,
} from './dto/guest-bookings.dto';
import { HostCancelReservationResponseDto } from './dto/host-cancel.dto';
import { BookingStatus, CancellationPolicy } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private readStore: ReadStoreService,
  ) {}

  private formatDateOnly(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return undefined;
    return dateObj.toISOString().slice(0, 10);
  }

  private toGuestBookingItem(b: any, todayStr: string): GuestBookingItemDto {
    const property = b.property;
    const vertical = (property?.type?.toLowerCase() || 'stay') as
      | 'stay'
      | 'experience'
      | 'transport';
    const checkInDate = this.formatDateOnly(b.checkIn) || null;
    const checkOutDate = this.formatDateOnly(b.checkOut) || null;
    const date = this.formatDateOnly(b.date) || null;

    let category: 'upcoming' | 'active' | 'recent' | 'cancelled' = 'upcoming';
    if (b.status === 'CANCELLED' || b.status === 'EXPIRED') {
      category = 'cancelled';
    } else if (b.status === 'COMPLETED') {
      category = 'recent';
    } else if (b.status === 'CHECKED_IN') {
      category = 'active';
    } else if (vertical === 'stay') {
      if (checkOutDate && checkOutDate < todayStr) {
        category = 'recent';
      } else if (
        checkInDate &&
        checkOutDate &&
        checkInDate <= todayStr &&
        checkOutDate >= todayStr
      ) {
        category = 'active';
      } else {
        category = 'upcoming';
      }
    } else {
      if (date && date < todayStr) {
        category = 'recent';
      } else {
        category = 'upcoming';
      }
    }

    let nightsCount: number | undefined = undefined;
    let stayProgress: string | undefined = undefined;
    if (vertical === 'stay' && b.checkIn && b.checkOut) {
      const checkInTime = new Date(b.checkIn).getTime();
      const checkOutTime = new Date(b.checkOut).getTime();
      nightsCount = Math.max(
        1,
        Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)),
      );
      if (category === 'active') {
        const todayTime = new Date(todayStr).getTime();
        const elapsedDays = Math.floor((todayTime - checkInTime) / (1000 * 60 * 60 * 24));
        const currentNight = Math.min(nightsCount, Math.max(1, elapsedDays + 1));
        stayProgress = `Night ${currentNight} of ${nightsCount}`;
      }
    }

    const mappedStatus = b.status.toLowerCase() as
      | 'confirmed'
      | 'checked_in'
      | 'completed'
      | 'cancelled'
      | 'pending';

    return {
      id: b.id,
      bookingRef: b.bookingRef,
      listingId: b.propertyId,
      listingTitle: property?.name || 'Listing',
      listingImage: (property as any)?.images?.[0]?.url || '',
      location: property?.location || '',
      vertical,
      status: mappedStatus,
      category,
      checkInDate,
      checkOutDate,
      date,
      timeSlot: b.timeSlot || null,
      nightsCount,
      stayProgress,
      guestsCount: b.guests,
      totalNgwee: b.amount,
      totalFormatted: `K${(b.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      currency: (b.currency === 'USD' ? 'USD' : 'ZMW') as 'ZMW' | 'USD',
      paymentStatus:
        b.payment?.status?.toLowerCase() || b.paymentStatus?.toLowerCase() || 'unpaid',
      hostName: property?.host?.businessName || property?.host?.name || 'Host',
      hostPhone: property?.host?.phone || undefined,
      createdAt: b.createdAt.toISOString(),
    };
  }

  async getGuestBookingsGrouped(userId: string): Promise<GuestBookingsGroupedDto> {
    const bookings = await this.prisma.booking.findMany({
      where: { guestId: userId },
      include: {
        property: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            host: { select: { id: true, name: true, businessName: true, phone: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    const items = bookings.map((b) => this.toGuestBookingItem(b, todayStr));

    const upcoming = items.filter((i) => i.category === 'upcoming');
    const active = items.filter((i) => i.category === 'active');
    const recent = items.filter((i) => i.category === 'recent');
    const cancelled = items.filter((i) => i.category === 'cancelled');

    return {
      upcoming,
      active,
      recent,
      cancelled,
      stats: {
        totalBookingsCount: items.length,
        upcomingCount: upcoming.length,
        activeCount: active.length,
        recentCount: recent.length,
      },
    };
  }

  async getGuestBookings(
    userId: string,
    query: GetGuestBookingsQueryDto,
  ): Promise<GuestBookingItemDto[]> {
    const targetUserId = query.userId || userId;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const grouped = await this.getGuestBookingsGrouped(targetUserId);

    let list: GuestBookingItemDto[] = [];
    if (query.category === 'upcoming') {
      list = grouped.upcoming;
    } else if (query.category === 'active') {
      list = grouped.active;
    } else if (query.category === 'recent') {
      list = grouped.recent;
    } else if (query.category === 'cancelled') {
      list = grouped.cancelled;
    } else {
      list = [...grouped.active, ...grouped.upcoming, ...grouped.recent, ...grouped.cancelled];
    }

    const skip = (page - 1) * limit;
    return list.slice(skip, skip + limit);
  }

  async create(userId: string, dto: CreateBookingDto) {
    const propertyId = dto.propertyId || dto.listingId;
    if (!propertyId) {
      throw new BadRequestException('propertyId (or listingId) is required');
    }

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: { select: { id: true, name: true, email: true, businessName: true } },
        stays: { where: { deletedAt: null } },
        experiences: { where: { deletedAt: null } },
        transports: { where: { deletedAt: null } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.deletedAt || property.status !== 'ACTIVE') {
      throw new BadRequestException('Property is not available');
    }
    if (property.hostId === userId) {
      throw new BadRequestException('Cannot book your own property');
    }

    const now = new Date();
    // 10-minute hold window for payment completion
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    // Resolve specific unit and unit price
    let unitPrice = 0;
    let stayId: string | null = null;
    let experienceId: string | null = null;
    let transportId: string | null = null;

    if (property.type === 'STAY') {
      const stay = dto.stayId
        ? property.stays.find((s) => s.id === dto.stayId)
        : property.stays[0];
      if (!stay) throw new BadRequestException('Stay unit not found or no units configured');
      stayId = stay.id;
      unitPrice = stay.price;

      if (!dto.checkIn || !dto.checkOut) {
        throw new BadRequestException('checkIn and checkOut dates are required for stays');
      }

      const checkInDate = new Date(dto.checkIn);
      const checkOutDate = new Date(dto.checkOut);
      if (checkInDate >= checkOutDate) {
        throw new BadRequestException('checkOut date must be after checkIn date');
      }

      // Check host-blocked dates
      const blockedSlot = await this.prisma.availabilitySlot.findFirst({
        where: {
          stayId,
          date: { gte: checkInDate, lt: checkOutDate },
          status: 'blocked',
        },
      });
      if (blockedSlot) {
        throw new ConflictException('Selected dates are blocked by the host');
      }

      // Check active hold or confirmed/checked-in booking overlap
      const overlapping = await this.prisma.booking.findFirst({
        where: {
          stayId,
          OR: [
            { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            { status: 'PENDING', expiresAt: { gt: now } },
          ],
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      });
      if (overlapping) {
        const isHeld = overlapping.status === 'PENDING';
        throw new ConflictException(
          isHeld
            ? 'These dates are currently on a 10-minute hold by another customer. Please try again shortly.'
            : 'These dates are already booked for this room/unit.',
        );
      }
    } else if (property.type === 'EXPERIENCE') {
      const exp = dto.experienceId
        ? property.experiences.find((e) => e.id === dto.experienceId)
        : property.experiences[0];
      if (!exp) throw new BadRequestException('Experience unit not found or no units configured');
      experienceId = exp.id;
      unitPrice = exp.price;

      if (!dto.date) {
        throw new BadRequestException('date is required for experience bookings');
      }
      const expDate = new Date(dto.date);

      // Check time slot active bookings and capacity
      const activeBookings = await this.prisma.booking.findMany({
        where: {
          experienceId,
          date: expDate,
          ...(dto.timeSlot ? { timeSlot: dto.timeSlot } : {}),
          OR: [
            { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            { status: 'PENDING', expiresAt: { gt: now } },
          ],
        },
        select: { guests: true, status: true },
      });

      const bookedCount = activeBookings.reduce((sum, b) => sum + b.guests, 0);
      const capacity = exp.maxParticipants || 1;

      if (bookedCount + dto.guests > capacity) {
        throw new ConflictException(
          `This experience slot is currently full or on a 10-minute hold. Only ${Math.max(0, capacity - bookedCount)} spots remaining.`,
        );
      }
    } else if (property.type === 'TRANSPORT') {
      const trans = dto.transportId
        ? property.transports.find((t) => t.id === dto.transportId)
        : property.transports[0];
      if (!trans) throw new BadRequestException('Transport unit not found or no units configured');
      transportId = trans.id;
      unitPrice = trans.pricePerSeat || 0;

      if (!dto.date) {
        throw new BadRequestException('date is required for transport bookings');
      }
      const transDate = new Date(dto.date);

      const activeBookings = await this.prisma.booking.findMany({
        where: {
          transportId,
          date: transDate,
          OR: [
            { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            { status: 'PENDING', expiresAt: { gt: now } },
          ],
        },
        select: { guests: true },
      });

      const bookedSeats = activeBookings.reduce((sum, b) => sum + b.guests, 0);
      const totalCapacity = trans.capacity || 50;

      if (bookedSeats + dto.guests > totalCapacity) {
        throw new ConflictException(
          `This transport route is fully booked or held for the selected date. Only ${Math.max(0, totalCapacity - bookedSeats)} seats remaining.`,
        );
      }
    }

    // Generate booking reference: NE-YYYY-NNNN
    const year = new Date().getFullYear();
    const count = await this.prisma.booking.count();
    const bookingRef = `NE-${year}-${String(count + 1).padStart(4, '0')}`;

    // Fetch user profile for customer detail fallback
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef,
        propertyId,
        stayId,
        experienceId,
        transportId,
        guestId: userId,
        hostId: property.hostId,
        amount: unitPrice * dto.guests,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        date: dto.date ? new Date(dto.date) : null,
        timeSlot: dto.timeSlot || null,
        expiresAt,
        guests: dto.guests,
        customerName: dto.customerName || user?.name || 'Guest',
        customerPhone: dto.customerPhone || user?.phone || '',
        customerEmail: dto.customerEmail || user?.email || null,
        specialRequests: dto.specialRequests || null,
      },
      include: {
        property: true,
        stay: true,
        experience: true,
        transport: true,
        guest: true,
      },
    });

    // Send full booking-created notifications (email + in-app) to both parties
    const guestUser = await this.prisma.user.findUnique({ where: { id: userId } });
    const listingName = booking.stay?.name || booking.experience?.name || booking.transport?.name || property.name;
    const checkInStr  = dto.checkIn  ? new Date(dto.checkIn).toLocaleDateString('en-ZM', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';
    const checkOutStr = dto.checkOut ? new Date(dto.checkOut).toLocaleDateString('en-ZM', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';

    await this.notifications.onBookingCreated({
      guestUserId: userId,
      guestEmail:  guestUser!.email,
      guestName:   guestUser!.name || 'Guest',
      hostUserId:  property.hostId,
      hostEmail:   property.host.email,
      hostName:    property.host.businessName || property.host.name || 'Host',
      bookingRef,
      listingId:   propertyId,
      listingName,
      checkIn:     checkInStr,
      checkOut:    checkOutStr,
      guests:      dto.guests,
      amountZMW:   unitPrice * dto.guests,
    });

    return this.formatBooking(booking);
  }

  async releaseHold(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId) throw new ForbiddenException();
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending holds can be released');
    }

    await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', expiresAt: null },
    });

    return { success: true, message: 'Hold released successfully' };
  }

  async findOne(id: string, userId: string, userRole: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingRef: id }],
      },
      include: {
        property: {
          include: {
            host: { select: { id: true, name: true, phone: true, businessName: true } },
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
        stay: true,
        experience: true,
        transport: true,
        guest: { select: { name: true, email: true, phone: true } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.hostId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException();
    }
    return this.formatBooking(booking);
  }

  async findMyBookings(userId: string, role?: string) {
    const where: any = {};
    if (role === 'host') {
      where.hostId = userId;
    } else {
      where.guestId = userId;
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        property: { include: { host: { select: { name: true, businessName: true } } } },
        stay: true,
        experience: true,
        transport: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.formatBooking(b));
  }

  async cancel(idOrBookingRef: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrBookingRef }, { bookingRef: idOrBookingRef }],
      },
      include: { property: true, stay: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status === 'CANCELLED') throw new BadRequestException('Booking already cancelled');
    if (booking.status === 'COMPLETED') throw new BadRequestException('Cannot cancel completed booking');

    // Calculate refund based on cancellation policy
    const policy = (booking.stay?.cancellationPolicy || 'MODERATE') as CancellationPolicy;
    let refundAmount = 0;
    const daysUntilCheckIn = booking.checkIn
      ? Math.ceil((booking.checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    switch (policy) {
      case 'FLEXIBLE':
        refundAmount = daysUntilCheckIn >= 1 ? booking.amount : 0;
        break;
      case 'MODERATE':
        refundAmount = daysUntilCheckIn >= 5 ? booking.amount : booking.amount * 0.5;
        break;
      case 'STRICT':
        refundAmount = 0;
        break;
    }

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        expiresAt: null,
        refundAmount: Math.round(refundAmount),
        paymentStatus: refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
      },
      include: { property: true, stay: true, experience: true, transport: true, guest: true },
    });

    const cancelledBy = userId === booking.guestId ? 'guest' : userId === booking.hostId ? 'host' : 'admin';

    const [guestForCancel, hostForCancel] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: booking.guestId } }),
      this.prisma.user.findUnique({ where: { id: booking.hostId } }),
    ]);
    const cancelListingName = updated.stay?.name || updated.experience?.name || updated.transport?.name || updated.property?.name || booking.bookingRef;

    await this.notifications.onBookingCancelled({
      guestUserId:  booking.guestId,
      guestEmail:   guestForCancel!.email,
      guestName:    guestForCancel!.name || 'Guest',
      hostUserId:   booking.hostId,
      hostEmail:    hostForCancel!.email,
      hostName:     hostForCancel!.businessName || hostForCancel!.name || 'Host',
      bookingRef:   booking.bookingRef,
      listingId:    booking.propertyId,
      listingName:  cancelListingName,
      refundAmountNgwee: Math.round(refundAmount),
      cancelledBy,
    });

    return {
      status: 'cancelled',
      refundEligible: refundAmount > 0,
      refundAmount: Math.round(refundAmount),
      policy: policy.toLowerCase(),
      message: refundAmount > 0
        ? `Refund of ZMW ${(refundAmount / 100).toFixed(2)} processed. Amount will reflect in 5-7 business days.`
        : 'No refund applicable based on the cancellation policy.',
    };
  }

  // ─── 4.1 Host Cancels Reservation ──────────────────────────────────────────

  async hostCancel(
    bookingRefOrId: string,
    hostId: string,
    reason?: string,
  ): Promise<HostCancelReservationResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingRefOrId }, { bookingRef: bookingRefOrId }],
      },
      include: {
        property: true,
        stay: true,
        experience: true,
        transport: true,
        guest: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const user = await this.prisma.user.findUnique({ where: { id: hostId } });
    if (booking.hostId !== hostId && booking.property.hostId !== hostId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only the host of this property can perform this cancellation');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('This booking has already been cancelled');
    }
    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    const cancellationReason = reason || 'Cancelled by host';
    const refundAmountNgwee = booking.amount;

    let penaltyFeeNgwee = 0;
    const now = new Date();
    const checkInDate = booking.checkIn || booking.date;
    if (checkInDate) {
      const diffHours = (new Date(checkInDate).getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours < 48) {
        penaltyFeeNgwee = Math.round(booking.amount * 0.1);
      }
    }

    const cancellationDate = now.toISOString();

    // ── Reopen Inventory ───────────────────────────────────────────────────────
    // 1. Stays: unblock any blocked calendar slots for this unit during booking dates
    if (booking.stayId && booking.checkIn && booking.checkOut) {
      await this.prisma.availabilitySlot.deleteMany({
        where: {
          stayId: booking.stayId,
          date: {
            gte: booking.checkIn,
            lt: booking.checkOut,
          },
          status: 'blocked',
        },
      });
    }

    // 2. Set booking status to CANCELLED and clear hold expiration
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        expiresAt: null,
        refundAmount: refundAmountNgwee,
        specialRequests: booking.specialRequests
          ? `${booking.specialRequests} | Host Cancelled: ${cancellationReason}`
          : `Host Cancelled: ${cancellationReason}`,
      },
    });

    // 3. Sync read-store index so search and calendar availability reflect reopened inventory immediately
    await this.readStore.enqueueSync(booking.propertyId).catch(() => null);

    // 4. Send cancellation notifications to guest and host
    await this.prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: 'BOOKING_CANCELLED',
        title: 'Reservation Cancelled by Host',
        description: `Your booking ${booking.bookingRef} for ${booking.property.name} was cancelled by the host. A full refund of ZMW ${(refundAmountNgwee / 100).toFixed(2)} has been issued.${reason ? ` Reason: ${reason}` : ''}`,
      },
    }).catch(() => null);

    await this.prisma.notification.create({
      data: {
        userId: booking.hostId,
        type: 'BOOKING_CANCELLED',
        title: 'Reservation Cancelled',
        description: `You cancelled booking ${booking.bookingRef}. Inventory has been reopened and the guest has received a full refund.${penaltyFeeNgwee > 0 ? ` Penalty fee: ZMW ${(penaltyFeeNgwee / 100).toFixed(2)}.` : ''}`,
      },
    }).catch(() => null);

    return {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      status: 'cancelled',
      inventoryReopened: true,
      refundAmountNgwee,
      penaltyFeeNgwee,
      cancellationDate,
    };
  }

  async updateStatus(id: string, userId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { property: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.hostId !== userId && booking.property.hostId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking already processed');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status, expiresAt: status === 'CONFIRMED' ? null : booking.expiresAt },
      include: { property: true, stay: true, experience: true, transport: true, guest: true, payout: true },
    });

    const guest = await this.prisma.user.findUnique({ where: { id: booking.guestId } });
    await this.notifications.sendBookingStatusUpdate(
      guest!.email, guest!.name, booking.bookingRef, status,
    );

    return this.formatBooking(updated);
  }

  // ─── Host Check-In & Funds Release ──────────────────────────────────────────

  async checkIn(idOrBookingRef: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrBookingRef }, { bookingRef: idOrBookingRef }],
      },
      include: {
        property: true,
        stay: true,
        experience: true,
        transport: true,
        host: true,
        payout: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (booking.hostId !== userId && booking.property.hostId !== userId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only the host of this property can perform check-in');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new BadRequestException('Cannot check in a cancelled or expired booking');
    }

    if (booking.checkedInAt || booking.status === 'CHECKED_IN') {
      throw new BadRequestException('This booking has already been checked in');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('This booking has already completed');
    }

    if (booking.paymentStatus !== 'PAID' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking cannot be checked in until payment is confirmed');
    }

    // Trigger release of funds to host:
    // 15% platform commission, 85% host net payout
    const commission = Math.round(booking.amount * 0.15);
    const netAmount = booking.amount - commission;

    let payout = booking.payout;
    if (!payout) {
      payout = await this.prisma.payout.create({
        data: {
          hostId: booking.hostId,
          bookingId: booking.id,
          amount: booking.amount,
          commission,
          netAmount,
          status: 'PROCESSING',
          method: booking.host.payoutMethod || 'BANK_TRANSFER',
          bookingRefs: [booking.bookingRef],
          processedAt: new Date(),
        },
      });
    }

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
      },
      include: {
        property: true,
        stay: true,
        experience: true,
        transport: true,
        guest: true,
        payout: true,
      },
    });

    // Notify Host about payout release
    await this.prisma.notification.create({
      data: {
        userId: booking.hostId,
        type: 'PAYOUT',
        title: 'Payout Released',
        description: `Check-in confirmed for booking ${booking.bookingRef}. Funds of ZMW ${(netAmount / 100).toFixed(2)} have been released.`,
      },
    }).catch(() => null);

    // Notify Guest about check-in
    await this.prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: 'CHECKED_IN',
        title: 'Check-in Confirmed',
        description: `You are checked in to ${booking.property.name}. Enjoy your stay!`,
      },
    }).catch(() => null);

    return {
      message: 'Check-in confirmed successfully. Payout has been released to host.',
      booking: this.formatBooking(updated),
      payout: {
        id: payout.id,
        amount: payout.amount,
        commission: payout.commission,
        netAmount: payout.netAmount,
        status: payout.status.toLowerCase(),
        method: payout.method,
      },
    };
  }

  // ─── Host Check-Out & Inventory Reopening ───────────────────────────────────

  async checkOut(idOrBookingRef: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrBookingRef }, { bookingRef: idOrBookingRef }],
      },
      include: {
        property: true,
        stay: true,
        experience: true,
        transport: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (booking.hostId !== userId && booking.property.hostId !== userId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only the host of this property can perform check-out');
    }

    if (booking.status === 'COMPLETED' || booking.checkedOutAt) {
      throw new BadRequestException('This booking has already been checked out');
    }

    if (!booking.checkedInAt && booking.status !== 'CHECKED_IN') {
      throw new BadRequestException('Booking must be checked in before checkout');
    }

    const checkedOutAt = new Date();

    // Reopen inventory:
    // If the guest checked out earlier than the scheduled checkOut date,
    // update checkOut to checkedOutAt so that any subsequent dates are immediately available.
    const updateData: any = {
      status: 'COMPLETED',
      checkedOutAt,
    };

    if (booking.checkOut && checkedOutAt < booking.checkOut) {
      updateData.checkOut = checkedOutAt;
    }

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
      include: {
        property: true,
        stay: true,
        experience: true,
        transport: true,
        guest: true,
        payout: true,
      },
    });

    // Notify Guest
    await this.prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: 'CHECKED_OUT',
        title: 'Check-out Completed',
        description: `Thank you for staying at ${booking.property.name}. Your checkout has been completed.`,
      },
    }).catch(() => null);

    return {
      message: 'Check-out completed successfully. Inventory has been reopened and is immediately available.',
      booking: this.formatBooking(updated),
    };
  }

  private formatBooking(booking: any) {
    const property = booking.property;
    const guest = booking.guest;
    const unitName = booking.stay?.name || booking.experience?.name || booking.transport?.name || null;

    const now = Date.now();
    const expiresAt = booking.expiresAt ? new Date(booking.expiresAt) : null;
    const isHoldActive = booking.status === 'PENDING' && expiresAt && expiresAt.getTime() > now;
    const holdExpiresInSeconds = isHoldActive
      ? Math.max(0, Math.floor((expiresAt.getTime() - now) / 1000))
      : 0;

    const checkInDate = booking.checkIn ? new Date(booking.checkIn) : null;
    const checkOutDate = booking.checkOut ? new Date(booking.checkOut) : null;
    const nights = checkInDate && checkOutDate
      ? Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;

    const nightlyRateNgwee = booking.stay?.price || Math.round(booking.amount / nights);
    const accommodationTotalNgwee = nightlyRateNgwee * nights;
    const cleaningFeeNgwee = booking.stay?.cleaningFee || 50000;
    const serviceFeeNgwee = Math.round(booking.amount * 0.1);
    const grandTotalNgwee = booking.amount;

    return {
      id: booking.id,
      bookingRef: booking.bookingRef,
      type: property?.type?.toLowerCase() || null,
      property: {
        id: booking.propertyId,
        name: property?.name || 'Nearby Escapes Property',
        vertical: (property?.type || 'stay').toLowerCase(),
        location: property?.location || 'Zambia',
        address: property?.location || 'Plot 45, Riverfront Road, Livingstone',
        image: property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      },
      host: {
        id: property?.host?.id || booking.hostId,
        name: property?.host?.businessName || property?.host?.name || 'Mwamba Chali',
        phone: property?.host?.phone || '+260 97 1234567',
        whatsapp: property?.host?.phone || '+260 97 1234567',
      },
      dates: {
        checkIn: checkInDate ? checkInDate.toISOString() : new Date().toISOString(),
        checkOut: checkOutDate ? checkOutDate.toISOString() : new Date().toISOString(),
        nights,
      },
      guests: {
        total: booking.guests || 1,
        adults: booking.guests || 1,
        children: 0,
      },
      financials: {
        currency: booking.currency || 'ZMW',
        nightlyRateNgwee,
        accommodationTotalNgwee,
        cleaningFeeNgwee,
        serviceFeeNgwee,
        taxesNgwee: 0,
        grandTotalNgwee,
        paymentStatus: (booking.payment?.status || booking.paymentStatus || 'PAID').toUpperCase(),
      },
      instructions: {
        checkInProcedure: 'Self check-in with keypad. Code will be sent on morning of arrival.',
        directions: property?.location ? `Follow road to ${property.location}. Gate is on the left.` : 'Follow main road to gate.',
        houseRules: ['No smoking inside chalets', 'Quiet hours after 22:00'],
      },
      propertyId: booking.propertyId,
      propertyName: property?.name || null,
      listingId: booking.propertyId, // backwards compatibility
      listingName: property?.name || null,
      stayId: booking.stayId || null,
      experienceId: booking.experienceId || null,
      transportId: booking.transportId || null,
      timeSlot: booking.timeSlot || null,
      unitName,
      guestId: booking.guestId,
      hostId: booking.hostId,
      status: booking.status.toLowerCase(),
      amount: booking.amount,
      amountFormatted: `K${(booking.amount / 100).toFixed(2)}`,
      currency: booking.currency,
      paymentStatus: booking.payment?.status?.toLowerCase() || booking.paymentStatus?.toLowerCase() || 'unpaid',
      hold: {
        isHoldActive: !!isHoldActive,
        expiresAt: expiresAt?.toISOString() || null,
        expiresInSeconds: holdExpiresInSeconds,
      },
      details: {
        checkIn: booking.checkIn?.toISOString().split('T')[0] || null,
        checkOut: booking.checkOut?.toISOString().split('T')[0] || null,
        date: booking.date?.toISOString().split('T')[0] || null,
        timeSlot: booking.timeSlot || null,
        guests: booking.guests,
      },
      checkedInAt: booking.checkedInAt ? new Date(booking.checkedInAt).toISOString() : null,
      checkedOutAt: booking.checkedOutAt ? new Date(booking.checkedOutAt).toISOString() : null,
      payout: booking.payout ? {
        id: booking.payout.id,
        amount: booking.payout.amount,
        commission: booking.payout.commission,
        netAmount: booking.payout.netAmount,
        status: booking.payout.status?.toLowerCase(),
      } : null,
      customer: {
        name: booking.customerName || guest?.name || null,
        phone: booking.customerPhone || guest?.phone || null,
        email: booking.customerEmail || guest?.email || null,
      },
      specialRequests: booking.specialRequests || null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
