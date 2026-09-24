import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, CancellationPolicy } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

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

    // Send notifications
    const guest = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.notifications.sendBookingStatusUpdate(
      guest!.email, guest!.name, bookingRef, 'PENDING',
    );
    await this.notifications.sendHostBookingRequest(
      property.host.email, property.host.businessName || property.host.name, bookingRef, guest!.name,
    );

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
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        property: { include: { host: { select: { name: true, businessName: true } } } },
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

  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
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
      where: { id },
      data: {
        status: 'CANCELLED',
        expiresAt: null,
        refundAmount: Math.round(refundAmount),
        paymentStatus: refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
      },
      include: { property: true, stay: true, experience: true, transport: true, guest: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.notifications.sendCancellationConfirmation(
      user!.email, user!.name, booking.bookingRef, refundAmount,
    );

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

  async checkIn(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
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

  async checkOut(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
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

    return {
      id: booking.id,
      bookingRef: booking.bookingRef,
      type: property?.type?.toLowerCase() || null,
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
