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
    const checkInDate = this.formatDateOnly(b.stayBooking?.checkIn) || null;
    const checkOutDate = this.formatDateOnly(b.stayBooking?.checkOut) || null;
    const date = this.formatDateOnly(b.experienceBooking?.date) || this.formatDateOnly(b.transportBooking?.date) || null;

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
    if (vertical === 'stay' && b.stayBooking?.checkIn && b.stayBooking?.checkOut) {
      const checkInTime = new Date(b.stayBooking.checkIn).getTime();
      const checkOutTime = new Date(b.stayBooking.checkOut).getTime();
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
      timeSlot: b.experienceBooking?.experienceSlotId || null,
      nightsCount,
      stayProgress,
      guestsCount: b.stayBooking?.guests ?? b.experienceBooking?.guests ?? (b.transportBooking as any)?.seats ?? 1,
      totalNgwee: b.amount,
      totalFormatted: `K${(b.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      currency: (b.currency === 'USD' ? 'USD' : 'ZMW') as 'ZMW' | 'USD',
      paymentStatus:
        b.payment?.status?.toLowerCase() || b.paymentStatus?.toLowerCase() || 'unpaid',
      hostName: (property?.host as any)?.hostProfile?.businessName || property?.host?.name || 'Host',
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
            host: { select: { id: true, name: true, phone: true, hostProfile: { select: { businessName: true } } } },
          },
        },
        payment: true,
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
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

﻿  async create(userId: string | undefined, dto: CreateBookingDto) {
    const propertyId = dto.propertyId || dto.listingId;
    if (!propertyId) {
      throw new BadRequestException('propertyId (or listingId) is required');
    }

    let property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: { select: { id: true, name: true, email: true, hostProfile: { select: { businessName: true } } } },
        stays: { where: { deletedAt: null } },
        experiences: { where: { deletedAt: null } },
        transports: { where: { deletedAt: null } },
      },
    });

    if (!property) {
      property = await this.prisma.property.findFirst({
        where: {
          OR: [
            { name: { contains: propertyId, mode: 'insensitive' } },
            ...(dto.listingType ? [{ type: dto.listingType.toUpperCase() as any }] : []),
          ],
          status: 'ACTIVE',
          deletedAt: null,
        },
        include: {
          host: { select: { id: true, name: true, email: true, hostProfile: { select: { businessName: true } } } },
          stays: { where: { deletedAt: null } },
          experiences: { where: { deletedAt: null } },
          transports: { where: { deletedAt: null } },
        },
      });
      if (!property) {
        property = await this.prisma.property.findFirst({
          where: { status: 'ACTIVE', deletedAt: null },
          include: {
            host: { select: { id: true, name: true, email: true, hostProfile: { select: { businessName: true } } } },
            stays: { where: { deletedAt: null } },
            experiences: { where: { deletedAt: null } },
            transports: { where: { deletedAt: null } },
          },
        });
      }
    }

    if (!property) throw new NotFoundException('Property not found');
    if (property.deletedAt || property.status !== 'ACTIVE') {
      throw new BadRequestException('Property is not available');
    }

    // Resolve guest user
    let guestUserId = userId;
    let guestUser = guestUserId ? await this.prisma.user.findUnique({ where: { id: guestUserId } }) : null;
    if (!guestUser) {
      const email = (dto.customerEmail || 'guest@nearbyescapes.com').toLowerCase().trim();
      guestUser = await this.prisma.user.findUnique({ where: { email } });
      if (!guestUser) {
        guestUser = await this.prisma.user.create({
          data: {
            email,
            name: dto.customerName || 'Guest User',
            phone: dto.customerPhone || '',
            role: 'GUEST',
            password: '',
          },
        });
      }
      guestUserId = guestUser.id;
    }

    if (property.hostId === guestUserId) {
      throw new BadRequestException('Cannot book your own property');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const isSimulated = dto.simulatePayment === true || dto.paymentMethod === 'SIMULATED' || process.env.SIMULATE_PAYMENTS === 'true';
    const status: BookingStatus = isSimulated ? 'CONFIRMED' : 'PENDING';
    const paymentStatus = isSimulated ? 'PAID' : 'UNPAID';
    const finalExpiresAt = isSimulated ? null : expiresAt;

    // Resolve specific unit and unit price
    let unitPrice = 0;
    let stayId: string | null = null;
    let experienceId: string | null = null;
    let transportId: string | null = null;

    if (property.type === 'STAY') {
      const stay = dto.stayId
        ? property.stays.find((s) => s.id === dto.stayId)
        : property.stays[0];
      stayId = stay?.id || null;
      unitPrice = stay ? stay.rate : 120000;

      if (!dto.checkIn || !dto.checkOut) {
        throw new BadRequestException('checkIn and checkOut dates are required for stays');
      }

      const checkInDate = new Date(dto.checkIn);
      const checkOutDate = new Date(dto.checkOut);
      if (checkInDate >= checkOutDate) {
        throw new BadRequestException('checkOut date must be after checkIn date');
      }

      if (stayId && !isSimulated) {
        const overlapping = await this.prisma.stayBooking.findFirst({
          where: {
            stayId,
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
            booking: {
              OR: [
                { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
                { status: 'PENDING', expiresAt: { gt: now } },
              ],
            },
          },
        });
        if (overlapping) {
          throw new ConflictException(
            'These dates are already booked or held for this room/unit.',
          );
        }
      }
    } else if (property.type === 'EXPERIENCE') {
      const exp = dto.experienceId
        ? property.experiences.find((e) => e.id === dto.experienceId)
        : property.experiences[0];
      experienceId = exp?.id || null;
      unitPrice = exp ? exp.rate : 85000;

      if (!dto.date) {
        throw new BadRequestException('date is required for experience bookings');
      }
      const expDate = new Date(dto.date);

      if (experienceId && !isSimulated) {
        const slot = await this.prisma.experienceSlot.findFirst({ where: { experienceId } });
        if (slot && slot.available < dto.guests) {
          throw new ConflictException(
            `This experience slot is currently full. Only ${slot.available} spots remaining.`,
          );
        }
      }
    } else if (property.type === 'TRANSPORT') {
      const trans = dto.transportId
        ? property.transports.find((t) => t.id === dto.transportId)
        : property.transports[0];
      transportId = trans?.id || null;
      unitPrice = trans ? trans.rate : 45000;

      if (!dto.date) {
        throw new BadRequestException('date is required for transport bookings');
      }

      if (transportId && !isSimulated) {
        const inv = await this.prisma.transportInventory.findFirst({ where: { transportId } });
        if (inv && inv.available < dto.guests) {
          throw new ConflictException(
            `This transport is fully booked. Only ${inv.available} seats remaining.`,
          );
        }
      }
    }

    // Generate booking reference: NE-YYYY-NNNN
    const year = new Date().getFullYear();
    const count = await this.prisma.booking.count();
    const bookingRef = `NE-${year}-${String(count + 1).padStart(4, '0')}`;

    const booking = await this.prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          bookingRef,
          propertyId: property.id,
          guestId: guestUserId!,
          hostId: property.hostId,
          type: property.type as any,
          amount: unitPrice * dto.guests,
          expiresAt: finalExpiresAt,
          status,
          paymentStatus,
          customerName: dto.customerName || guestUser?.name || 'Guest',
          customerPhone: dto.customerPhone || guestUser?.phone || '',
          customerEmail: dto.customerEmail || guestUser?.email || null,
          specialRequests: dto.specialRequests || null,
          ...(isSimulated
            ? {
                payment: {
                  create: {
                    userId: guestUserId!,
                    amount: unitPrice * dto.guests,
                    status: 'PAID',
                    provider: 'SIMULATED',
                    providerRef: `SIM-${Date.now()}`,
                  },
                },
              }
            : {}),
        },
      });

      if (property.type === 'STAY' && stayId) {
        // Find or use first inventory
        const stayInv = await tx.stayInventory.findFirst({ where: { stayId } });
        if (stayInv) {
          await tx.stayBooking.create({
            data: {
              bookingId: createdBooking.id,
              stayId,
              stayInventoryId: stayInv.id,
              checkIn: new Date(dto.checkIn!),
              checkOut: new Date(dto.checkOut!),
              guests: dto.guests,
            },
          });
          await tx.stayInventory.update({
            where: { id: stayInv.id },
            data: { booked: { increment: 1 }, available: { decrement: 1 } },
          });
        }
      } else if (property.type === 'EXPERIENCE' && experienceId) {
        const expSlot = await tx.experienceSlot.findFirst({ where: { experienceId } });
        if (expSlot) {
          await tx.experienceBooking.create({
            data: {
              bookingId: createdBooking.id,
              experienceId,
              experienceSlotId: expSlot.id,
              date: new Date(dto.date!),
              guests: dto.guests,
            },
          });
          await tx.experienceSlot.update({
            where: { id: expSlot.id },
            data: { booked: { increment: dto.guests }, available: { decrement: dto.guests } },
          });
        }
      } else if (property.type === 'TRANSPORT' && transportId) {
        const transInv = await tx.transportInventory.findFirst({ where: { transportId } });
        if (transInv) {
          await tx.transportBooking.create({
            data: {
              bookingId: createdBooking.id,
              transportId,
              transportInventoryId: transInv.id,
              date: new Date(dto.date!),
              seats: dto.guests,
            },
          });
          await tx.transportInventory.update({
            where: { id: transInv.id },
            data: { booked: { increment: dto.guests }, available: { decrement: dto.guests } },
          });
        }
      }

      return tx.booking.findUnique({
        where: { id: createdBooking.id },
        include: {
          property: true,
          guest: true,
          payment: true,
          stayBooking: true,
          experienceBooking: true,
          transportBooking: true,
        },
      });
    });

    await this.readStore.enqueueSync(property.id).catch(() => null);

    const listingName = property.name;
    const checkInStr  = dto.checkIn  ? new Date(dto.checkIn).toLocaleDateString('en-ZM', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';
    const checkOutStr = dto.checkOut ? new Date(dto.checkOut).toLocaleDateString('en-ZM', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';

    if (isSimulated) {
      await this.notifications.onBookingConfirmed({
        guestUserId: guestUserId!,
        guestEmail:  guestUser!.email,
        guestName:   guestUser!.name || 'Guest',
        hostUserId:  property.hostId,
        hostEmail:   property.host.email,
        hostName:    (property.host as any)?.hostProfile?.businessName || property.host.name || 'Host',
        bookingRef,
        listingId:   property.id,
        listingName,
        checkIn:     checkInStr,
        checkOut:    checkOutStr,
        guests:      dto.guests,
        amountZMW:   unitPrice * dto.guests,
      }).catch(() => null);
    } else {
      await this.notifications.onBookingCreated({
        guestUserId: guestUserId!,
        guestEmail:  guestUser!.email,
        guestName:   guestUser!.name || 'Guest',
        hostUserId:  property.hostId,
        hostEmail:   property.host.email,
        hostName:    (property.host as any)?.hostProfile?.businessName || property.host.name || 'Host',
        bookingRef,
        listingId:   property.id,
        listingName,
        checkIn:     checkInStr,
        checkOut:    checkOutStr,
        guests:      dto.guests,
        amountZMW:   unitPrice * dto.guests,
      }).catch(() => null);
    }

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
            host: { select: { id: true, name: true, phone: true, hostProfile: { select: { businessName: true } } } },
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
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
        property: { include: { host: { select: { name: true, hostProfile: { select: { businessName: true } } } } } },
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
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
      include: { property: true, stayBooking: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status === 'CANCELLED') throw new BadRequestException('Booking already cancelled');
    if (booking.status === 'COMPLETED') throw new BadRequestException('Cannot cancel completed booking');

    // Calculate refund based on cancellation policy
    const policy = 'MODERATE';
    let refundAmount = 0;
    const checkInTime = booking.stayBooking?.checkIn ? new Date(booking.stayBooking.checkIn).getTime() : 0;
    const daysUntilCheckIn = checkInTime
      ? Math.ceil((checkInTime - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    switch (policy as string) {
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
      include: { property: true, stayBooking: true, experienceBooking: true, transportBooking: true, guest: true },
    });

    const cancelledBy = userId === booking.guestId ? 'guest' : userId === booking.hostId ? 'host' : 'admin';

    const [guestForCancel, hostForCancel] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: booking.guestId } }),
      this.prisma.user.findUnique({ where: { id: booking.hostId } }),
    ]);
    const cancelListingName = updated.property?.name || booking.bookingRef;

    await this.notifications.onBookingCancelled({
      guestUserId:  booking.guestId,
      guestEmail:   guestForCancel!.email,
      guestName:    guestForCancel!.name || 'Guest',
      hostUserId:   booking.hostId,
      hostEmail:    hostForCancel!.email,
      hostName:     (hostForCancel as any)?.hostProfile?.businessName || hostForCancel!.name || 'Host',
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
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
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
    const checkInDate = booking.stayBooking?.checkIn || booking.experienceBooking?.date || booking.transportBooking?.date;
    if (checkInDate) {
      const diffHours = (new Date(checkInDate).getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours < 48) {
        penaltyFeeNgwee = Math.round(booking.amount * 0.1);
      }
    }

    const cancellationDate = now.toISOString();

    // ── Reopen Inventory ───────────────────────────────────────────────────────
    if (booking.stayBooking) {
      await this.prisma.stayInventory.update({
        where: { id: booking.stayBooking.stayInventoryId },
        data: { booked: { decrement: 1 }, available: { increment: 1 } },
      }).catch(() => null);
    } else if (booking.experienceBooking) {
      await this.prisma.experienceSlot.update({
        where: { id: booking.experienceBooking.experienceSlotId },
        data: { booked: { decrement: booking.experienceBooking.guests }, available: { increment: booking.experienceBooking.guests } },
      }).catch(() => null);
    } else if (booking.transportBooking) {
      await this.prisma.transportInventory.update({
        where: { id: booking.transportBooking.transportInventoryId },
        data: { booked: { decrement: booking.transportBooking.seats }, available: { increment: booking.transportBooking.seats } },
      }).catch(() => null);
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
      include: { property: true, stayBooking: true, experienceBooking: true, transportBooking: true, guest: true, payout: true },
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
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
        host: { include: { hostProfile: true } },
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

    if (booking.stayBooking?.checkedInAt || booking.status === 'CHECKED_IN') {
      throw new BadRequestException('This booking has already been checked in');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('This booking has already completed');
    }

    if (booking.paymentStatus !== 'PAID' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking cannot be checked in until payment is confirmed');
    }

    // Step 1: Notify Guest to confirm check-in
    await this.prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: 'CHECKED_IN',
        title: 'Check-in Confirmation Requested',
        description: `Host for ${booking.property.name} requested check-in for booking ${booking.bookingRef}. Please confirm your check-in. If not confirmed, it will auto-confirm in 24 hours.`,
        actionUrl: `/bookings/${booking.id}/confirm-check-in`,
        actionLabel: 'Confirm Check-In',
      },
    }).catch(() => null);

    return {
      message: 'Check-in initiated. Waiting for guest confirmation. Auto-confirm scheduled in 24 hours.',
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      checkInPending: true,
      autoConfirmHours: 24,
    };
  }

  async confirmCheckIn(idOrBookingRef: string, userId?: string, isAutoConfirm: boolean = false) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrBookingRef }, { bookingRef: idOrBookingRef }],
      },
      include: {
        property: true,
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
        host: { include: { hostProfile: true } },
        payout: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (booking.guestId !== userId && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Only the guest of this booking can confirm check-in');
      }
    }

    if (booking.stayBooking?.checkedInAt || booking.status === 'CHECKED_IN') {
      return {
        message: 'This booking has already been checked in',
        booking: this.formatBooking(booking),
      };
    }

    // Step 2: Trigger release of funds to host:
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
          method: (booking.host as any)?.hostProfile?.payoutMethod || 'BANK_TRANSFER',
          bookingRefs: [booking.bookingRef],
          processedAt: new Date(),
        },
      });
    }

    if (booking.stayBooking) {
      await this.prisma.stayBooking.update({
        where: { bookingId: booking.id },
        data: { checkedInAt: new Date() },
      });
    }

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CHECKED_IN',
      },
      include: {
        property: true,
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
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
        description: `Check-in confirmed for booking ${booking.bookingRef}${isAutoConfirm ? ' (24h auto-confirm)' : ''}. Funds of ZMW ${(netAmount / 100).toFixed(2)} have been released.`,
      },
    }).catch(() => null);

    // Notify Guest about check-in completion
    await this.prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: 'CHECKED_IN',
        title: 'Check-in Complete',
        description: `You are confirmed checked in to ${booking.property.name}. Enjoy your stay!`,
      },
    }).catch(() => null);

    return {
      message: isAutoConfirm
        ? 'Check-in auto-confirmed after 24 hours. Payout released to host.'
        : 'Check-in confirmed successfully. Payout has been released to host.',
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
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (booking.hostId !== userId && booking.property.hostId !== userId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only the host of this property can perform check-out');
    }

    if (booking.status === 'COMPLETED' || booking.stayBooking?.checkedOutAt) {
      throw new BadRequestException('This booking has already been checked out');
    }

    if (!booking.stayBooking?.checkedInAt && booking.status !== 'CHECKED_IN') {
      throw new BadRequestException('Booking must be checked in before checkout');
    }

    const checkedOutAt = new Date();

    if (booking.stayBooking) {
      await this.prisma.stayBooking.update({
        where: { bookingId: booking.id },
        data: { checkedOutAt },
      });
    }

    const updateData: any = {
      status: 'COMPLETED',
    };

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
      include: {
        property: true,
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
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
    const unitName = property?.name || null;

    const now = Date.now();
    const expiresAt = booking.expiresAt ? new Date(booking.expiresAt) : null;
    const isHoldActive = booking.status === 'PENDING' && expiresAt && expiresAt.getTime() > now;
    const holdExpiresInSeconds = isHoldActive
      ? Math.max(0, Math.floor((expiresAt.getTime() - now) / 1000))
      : 0;

    const checkInDate = booking.stayBooking?.checkIn ? new Date(booking.stayBooking.checkIn) : null;
    const checkOutDate = booking.stayBooking?.checkOut ? new Date(booking.stayBooking.checkOut) : null;
    const nights = checkInDate && checkOutDate
      ? Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;

    const nightlyRateNgwee = Math.round(booking.amount / nights);
    const accommodationTotalNgwee = nightlyRateNgwee * nights;
    const cleaningFeeNgwee = 50000;
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
        name: (property?.host as any)?.hostProfile?.businessName || property?.host?.name || 'Mwamba Chali',
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
        checkIn: booking.stayBooking?.checkIn ? new Date(booking.stayBooking.checkIn).toISOString().split('T')[0] : null,
        checkOut: booking.stayBooking?.checkOut ? new Date(booking.stayBooking.checkOut).toISOString().split('T')[0] : null,
        date: booking.experienceBooking?.date ? new Date(booking.experienceBooking.date).toISOString().split('T')[0] : booking.transportBooking?.date ? new Date(booking.transportBooking.date).toISOString().split('T')[0] : null,
        timeSlot: null,
        guests: booking.stayBooking?.guests || booking.experienceBooking?.guests || booking.transportBooking?.seats || 1,
      },
      checkedInAt: booking.stayBooking?.checkedInAt ? new Date(booking.stayBooking.checkedInAt).toISOString() : null,
      checkedOutAt: booking.stayBooking?.checkedOutAt ? new Date(booking.stayBooking.checkedOutAt).toISOString() : null,
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
