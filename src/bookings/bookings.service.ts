import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { BookingReadService } from './booking-read.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  GuestBookingsGroupedDto,
  GetGuestBookingsQueryDto,
} from './dto/guest-bookings.dto';
import { GuestBookingItemDto } from './dto/guest-bookings.dto';
import { HostCancelReservationResponseDto } from './dto/host-cancel.dto';
import { BookingStatus, PropertyStatus } from '@prisma/client';
import { formatBooking } from './bookings.mapper';
import { combineDateAndTimeInZone, dateInTimeZone } from '../common/zoned-date-time';

const BOOKING_REFERENCE_LOCK_KEY = 94721531;

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private readStore: ReadStoreService,
    private readService: BookingReadService,
  ) {}

  private readonly logger = new Logger(BookingsService.name);

  async create(userId: string | undefined, dto: CreateBookingDto) {
    const propertyId = dto.propertyId || dto.listingId;
    if (!propertyId) {
      throw new BadRequestException('propertyId (or listingId) is required');
    }

    let property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            hostProfile: {
              select: {
                businessName: true,
                defaultCheckInTime: true,
                defaultCheckOutTime: true,
              },
            },
          },
        },
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
            ...(dto.listingType
              ? [{ type: dto.listingType.toUpperCase() as any }]
              : []),
          ],
          status: 'ACTIVE',
          deletedAt: null,
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              hostProfile: {
                select: {
                  businessName: true,
                  defaultCheckInTime: true,
                  defaultCheckOutTime: true,
                },
              },
            },
          },
          stays: { where: { deletedAt: null } },
          experiences: { where: { deletedAt: null } },
          transports: { where: { deletedAt: null } },
        },
      });
      if (!property) {
        property = await this.prisma.property.findFirst({
          where: { status: 'ACTIVE', deletedAt: null },
          include: {
            host: {
              select: {
                id: true,
                name: true,
                email: true,
                hostProfile: {
                  select: {
                    businessName: true,
                    defaultCheckInTime: true,
                    defaultCheckOutTime: true,
                  },
                },
              },
            },
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
    let guestUser = guestUserId
      ? await this.prisma.user.findUnique({ where: { id: guestUserId } })
      : null;
    if (!guestUser) {
      const email = (dto.customerEmail || 'guest@nearbyescapes.com')
        .toLowerCase()
        .trim();
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

    const isSimulated =
      dto.simulatePayment === true ||
      dto.paymentMethod === 'SIMULATED' ||
      process.env.SIMULATE_PAYMENTS === 'true';
    const status: BookingStatus = isSimulated ? 'CONFIRMED' : 'PENDING';
    const paymentStatus = isSimulated ? 'PAID' : 'UNPAID';
    const finalExpiresAt = isSimulated ? null : expiresAt;

    // Resolve specific unit and unit price
    let unitPrice = 0;
    let stayId: string | null = null;
    let stayCheckInAt: Date | null = null;
    let stayCheckOutAt: Date | null = null;
    let experienceId: string | null = null;
    let transportId: string | null = null;

    if (property.type === 'STAY') {
      const stay = dto.stayId
        ? property.stays.find((s) => s.id === dto.stayId)
        : property.stays[0];
      stayId = stay?.id || null;
      unitPrice = stay ? stay.rate : 120000;

      if (!dto.checkIn || !dto.checkOut) {
        throw new BadRequestException(
          'checkIn and checkOut dates are required for stays',
        );
      }

      const checkInDate = new Date(dto.checkIn);
      const checkOutDate = new Date(dto.checkOut);
      if (checkInDate >= checkOutDate) {
        throw new BadRequestException(
          'checkOut date must be after checkIn date',
        );
      }

      const checkInAt = dto.checkIn.includes('T')
        ? checkInDate
        : combineDateAndTimeInZone(
            dto.checkIn,
            property.host.hostProfile?.defaultCheckInTime || '14:00',
          );
      const checkOutAt = dto.checkOut.includes('T')
        ? checkOutDate
        : combineDateAndTimeInZone(
            dto.checkOut,
            property.host.hostProfile?.defaultCheckOutTime || '10:00',
          );
      if (checkInAt >= checkOutAt) {
        throw new BadRequestException(
          'Check-out time must be after check-in time',
        );
      }
      stayCheckInAt = checkInAt;
      stayCheckOutAt = checkOutAt;

      if (stayId) {
        const checkInDay = dateInTimeZone(checkInAt);
        const checkOutDay = dateInTimeZone(checkOutAt);
        const blocks = await this.prisma.stayDateBlock.findMany({
          where: {
            stayId,
            status: 'ACTIVE',
            startDate: { lte: new Date(`${checkOutDay}T00:00:00.000Z`) },
            endDate: { gte: new Date(`${checkInDay}T00:00:00.000Z`) },
          },
          select: {
            id: true,
            reason: true,
            startDate: true,
            endDate: true,
            checkInAt: true,
            checkOutAt: true,
          },
        });
        const overlappingBlock = blocks.find((block) => {
          if (block.checkOutAt && block.checkOutAt <= now) return false;
          const blockStart =
            block.checkInAt ||
            combineDateAndTimeInZone(block.startDate, '00:00');
          const blockEnd = block.checkOutAt || combineDateAndTimeInZone(
            new Date(block.endDate.getTime() + 86400000),
            '00:00',
          );
          return checkInAt < blockEnd && checkOutAt > blockStart;
        });
        if (overlappingBlock) {
          throw new ConflictException(
            `These dates are blocked by the host${overlappingBlock.reason ? ` (${overlappingBlock.reason})` : ''}.`,
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
        throw new BadRequestException(
          'date is required for experience bookings',
        );
      }
    } else if (property.type === 'TRANSPORT') {
      const trans = dto.transportId
        ? property.transports.find((t) => t.id === dto.transportId)
        : property.transports[0];
      transportId = trans?.id || null;
      unitPrice = trans ? trans.rate : 45000;

      if (!dto.date) {
        throw new BadRequestException(
          'date is required for transport bookings',
        );
      }

    }

    const booking = await this.prisma.$transaction(async (tx) => {
      let stayInventoryId: string | null = null;
      let experienceSlotId: string | null = null;
      let transportInventoryId: string | null = null;

      if (property.type === 'STAY' && stayId) {
        if (!stayCheckInAt || !stayCheckOutAt) {
          throw new BadRequestException(
            'Stay check-in and check-out timestamps are required',
          );
        }

        const lockedInventories = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT "id"
          FROM "StayInventory"
          WHERE "stayId" = ${stayId}
            AND "isActive" = true
            AND "deletedAt" IS NULL
          ORDER BY "id"
          FOR UPDATE
        `;
        if (lockedInventories.length === 0) {
          throw new ConflictException(
            'No stay inventory is currently available.',
          );
        }

        if (!isSimulated) {
          const overlapping = await tx.stayBooking.findFirst({
            where: {
              stayId,
              checkIn: { lt: stayCheckOutAt },
              checkOut: { gt: stayCheckInAt },
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

        const stayInventories = await tx.stayInventory.findMany({
          where: { id: { in: lockedInventories.map(({ id }) => id) } },
          orderBy: { createdAt: 'asc' },
        });
        const stayInv = stayInventories.find(
          (inventory) => inventory.available > 0,
        );
        if (!stayInv) {
          throw new ConflictException(
            'No stay inventory is currently available.',
          );
        }
        stayInventoryId = stayInv.id;
      } else if (property.type === 'EXPERIENCE' && experienceId) {
        const lockedSlots = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT "id"
          FROM "ExperienceSlot"
          WHERE "experienceId" = ${experienceId}
            AND "isActive" = true
            AND "deletedAt" IS NULL
          ORDER BY "id"
          FOR UPDATE
        `;
        const slots = await tx.experienceSlot.findMany({
          where: { id: { in: lockedSlots.map(({ id }) => id) } },
          orderBy: { createdAt: 'asc' },
        });
        const expSlot = slots.find((slot) => slot.available >= dto.guests);
        if (!expSlot) {
          throw new ConflictException(
            'This experience slot does not have enough available capacity.',
          );
        }
        experienceSlotId = expSlot.id;
      } else if (property.type === 'TRANSPORT' && transportId) {
        const lockedInventories = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT "id"
          FROM "TransportInventory"
          WHERE "transportId" = ${transportId}
            AND "isActive" = true
            AND "deletedAt" IS NULL
          ORDER BY "id"
          FOR UPDATE
        `;
        const inventories = await tx.transportInventory.findMany({
          where: { id: { in: lockedInventories.map(({ id }) => id) } },
          orderBy: { createdAt: 'asc' },
        });
        const transInv = inventories.find(
          (inventory) => inventory.available >= dto.guests,
        );
        if (!transInv) {
          throw new ConflictException(
            'This transport does not have enough available seats.',
          );
        }
        transportInventoryId = transInv.id;
      }

      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(${BOOKING_REFERENCE_LOCK_KEY})
      `;
      const year = new Date().getFullYear();
      const count = await tx.booking.count();
      const bookingRef = `NE-${year}-${String(count + 1).padStart(4, '0')}`;

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
        const inventoryId = stayInventoryId;
        const checkInAt = stayCheckInAt;
        const checkOutAt = stayCheckOutAt;
        if (!inventoryId || !checkInAt || !checkOutAt) {
          throw new BadRequestException(
            'Stay inventory and timestamps are required',
          );
        }
        await tx.stayBooking.create({
          data: {
            bookingId: createdBooking.id,
            stayId,
            stayInventoryId: inventoryId,
            checkIn: checkInAt,
            checkOut: checkOutAt,
            guests: dto.guests,
          },
        });
        const inventoryUpdate = await tx.stayInventory.updateMany({
          where: { id: inventoryId, available: { gt: 0 } },
          data: { booked: { increment: 1 }, available: { decrement: 1 } },
        });
        if (inventoryUpdate.count !== 1) {
          throw new ConflictException('No stay inventory is currently available.');
        }
      } else if (property.type === 'EXPERIENCE' && experienceId) {
        const slotId = experienceSlotId;
        if (!slotId || !dto.date) {
          throw new BadRequestException(
            'Experience slot and date are required',
          );
        }
        await tx.experienceBooking.create({
          data: {
            bookingId: createdBooking.id,
            experienceId,
            experienceSlotId: slotId,
            date: new Date(dto.date),
            guests: dto.guests,
          },
        });
        const slotUpdate = await tx.experienceSlot.updateMany({
          where: {
            id: slotId,
            available: { gte: dto.guests },
          },
          data: {
            booked: { increment: dto.guests },
            available: { decrement: dto.guests },
          },
        });
        if (slotUpdate.count !== 1) {
          throw new ConflictException(
            'This experience slot does not have enough available capacity.',
          );
        }
      } else if (property.type === 'TRANSPORT' && transportId) {
        const inventoryId = transportInventoryId;
        if (!inventoryId || !dto.date) {
          throw new BadRequestException(
            'Transport inventory and date are required',
          );
        }
        await tx.transportBooking.create({
          data: {
            bookingId: createdBooking.id,
            transportId,
            transportInventoryId: inventoryId,
            date: new Date(dto.date),
            seats: dto.guests,
          },
        });
        const inventoryUpdate = await tx.transportInventory.updateMany({
          where: {
            id: inventoryId,
            available: { gte: dto.guests },
          },
          data: {
            booked: { increment: dto.guests },
            available: { decrement: dto.guests },
          },
        });
        if (inventoryUpdate.count !== 1) {
          throw new ConflictException(
            'This transport does not have enough available seats.',
          );
        }
      }

      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Property"
        WHERE "id" = ${property.id}
        FOR UPDATE
      `;

      await this.syncPropertyStatus(tx, property.id);

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
    const checkInStr = dto.checkIn
      ? new Date(dto.checkIn).toLocaleDateString('en-ZM', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'TBD';
    const checkOutStr = dto.checkOut
      ? new Date(dto.checkOut).toLocaleDateString('en-ZM', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'TBD';

    if (isSimulated) {
      await this.notifications
        .onBookingConfirmed({
          guestUserId: guestUserId!,
          guestEmail: guestUser.email,
          guestName: guestUser.name || 'Guest',
          hostUserId: property.hostId,
          hostEmail: property.host.email,
          hostName:
            (property.host as any)?.hostProfile?.businessName ||
            property.host.name ||
            'Host',
          bookingRef,
          listingId: property.id,
          listingName,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          guests: dto.guests,
          amountZMW: unitPrice * dto.guests,
        })
        .catch(() => null);
    } else {
      await this.notifications
        .onBookingCreated({
          guestUserId: guestUserId!,
          guestEmail: guestUser.email,
          guestName: guestUser.name || 'Guest',
          hostUserId: property.hostId,
          hostEmail: property.host.email,
          hostName:
            (property.host as any)?.hostProfile?.businessName ||
            property.host.name ||
            'Host',
          bookingRef,
          listingId: property.id,
          listingName,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          guests: dto.guests,
          amountZMW: unitPrice * dto.guests,
        })
        .catch(() => null);
    }

    return formatBooking(booking);
  }

  async releaseHold(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId) throw new ForbiddenException();
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending holds can be released');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED', expiresAt: null },
      });

      await this.restoreInventoryForBooking(tx, booking);
      await this.syncPropertyStatus(tx, booking.propertyId);
    });

    await this.readStore.enqueueSync(booking.propertyId).catch(() => null);

    return { success: true, message: 'Hold released successfully' };
  }

  async getGuestBookingsGrouped(
    userId: string,
  ): Promise<GuestBookingsGroupedDto> {
    return this.readService.getGuestBookingsGrouped(userId);
  }

  async getGuestBookings(
    userId: string,
    query: GetGuestBookingsQueryDto,
  ): Promise<GuestBookingItemDto[]> {
    return this.readService.getGuestBookings(userId, query);
  }

  async findOne(id: string, userId: string, userRole: string) {
    return this.readService.findOne(id, userId, userRole);
  }

  async getReceipt(id: string, userId: string, userRole: string) {
    return this.readService.getReceipt(id, userId, userRole);
  }

  async findMyBookings(userId: string, role?: string) {
    return this.readService.findMyBookings(userId, role);
  }

  async cancel(idOrBookingRef: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrBookingRef }, { bookingRef: idOrBookingRef }],
      },
      include: {
        property: true,
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status === 'CANCELLED')
      throw new BadRequestException('Booking already cancelled');
    if (booking.status === 'COMPLETED')
      throw new BadRequestException('Cannot cancel completed booking');

    // Calculate refund based on cancellation policy
    const policy = 'MODERATE';
    let refundAmount = 0;
    const checkInTime = booking.stayBooking?.checkIn
      ? new Date(booking.stayBooking.checkIn).getTime()
      : 0;
    const daysUntilCheckIn = checkInTime
      ? Math.ceil((checkInTime - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    switch (policy as string) {
      case 'FLEXIBLE':
        refundAmount = daysUntilCheckIn >= 1 ? booking.amount : 0;
        break;
      case 'MODERATE':
        refundAmount =
          daysUntilCheckIn >= 5 ? booking.amount : booking.amount * 0.5;
        break;
      case 'STRICT':
        refundAmount = 0;
        break;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const upd = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          expiresAt: null,
          refundAmount: Math.round(refundAmount),
          paymentStatus: refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
        },
        include: {
          property: true,
          stayBooking: true,
          experienceBooking: true,
          transportBooking: true,
          guest: true,
        },
      });

      await this.restoreInventoryForBooking(tx, upd);
      await this.syncPropertyStatus(tx, booking.propertyId);
      return upd;
    });

    const cancelledBy =
      userId === booking.guestId
        ? 'guest'
        : userId === booking.hostId
          ? 'host'
          : 'admin';

    const [guestForCancel, hostForCancel] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: booking.guestId } }),
      this.prisma.user.findUnique({ where: { id: booking.hostId } }),
    ]);
    const cancelListingName = updated.property?.name || booking.bookingRef;

    await this.readStore.enqueueSync(booking.propertyId).catch(() => null);

    await this.notifications.onBookingCancelled({
      guestUserId: booking.guestId,
      guestEmail: guestForCancel!.email,
      guestName: guestForCancel!.name || 'Guest',
      hostUserId: booking.hostId,
      hostEmail: hostForCancel!.email,
      hostName:
        (hostForCancel as any)?.hostProfile?.businessName ||
        hostForCancel!.name ||
        'Host',
      bookingRef: booking.bookingRef,
      listingId: booking.propertyId,
      listingName: cancelListingName,
      refundAmountNgwee: Math.round(refundAmount),
      cancelledBy,
    });

    return {
      status: 'cancelled',
      refundEligible: refundAmount > 0,
      refundAmount: Math.round(refundAmount),
      policy: policy.toLowerCase(),
      message:
        refundAmount > 0
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
    if (
      booking.hostId !== hostId &&
      booking.property.hostId !== hostId &&
      user?.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Only the host of this property can perform this cancellation',
      );
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
    const checkInDate =
      booking.stayBooking?.checkIn ||
      booking.experienceBooking?.date ||
      booking.transportBooking?.date;
    if (checkInDate) {
      const diffHours =
        (new Date(checkInDate).getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours < 48) {
        penaltyFeeNgwee = Math.round(booking.amount * 0.1);
      }
    }

    const cancellationDate = now.toISOString();

    // ── Reopen Inventory, Cancel Booking, and Sync Property Status ────────────────
    await this.prisma.$transaction(async (tx) => {
      if (booking.stayBooking) {
        await tx.stayInventory.update({
          where: { id: booking.stayBooking.stayInventoryId },
          data: { booked: { decrement: 1 }, available: { increment: 1 } },
        });
      } else if (booking.experienceBooking) {
        await tx.experienceSlot.update({
          where: { id: booking.experienceBooking.experienceSlotId },
          data: {
            booked: { decrement: booking.experienceBooking.guests },
            available: { increment: booking.experienceBooking.guests },
          },
        });
      } else if (booking.transportBooking) {
        await tx.transportInventory.update({
          where: { id: booking.transportBooking.transportInventoryId },
          data: {
            booked: { decrement: booking.transportBooking.seats },
            available: { increment: booking.transportBooking.seats },
          },
        });
      }

      // 2. Set booking status to CANCELLED and clear hold expiration
      await tx.booking.update({
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

      // 2.5 Sync property status based on restored inventory
      await this.syncPropertyStatus(tx, booking.propertyId);
    });

    // 3. Sync read-store index so search and calendar availability reflect reopened inventory immediately
    await this.readStore.enqueueSync(booking.propertyId).catch(() => null);

    // 4. Send cancellation notifications to guest and host
    await this.prisma.notification
      .create({
        data: {
          userId: booking.guestId,
          type: 'BOOKING_CANCELLED',
          title: 'Reservation Cancelled by Host',
          description: `Your booking ${booking.bookingRef} for ${booking.property.name} was cancelled by the host. A full refund of ZMW ${(refundAmountNgwee / 100).toFixed(2)} has been issued.${reason ? ` Reason: ${reason}` : ''}`,
        },
      })
      .catch(() => null);

    await this.prisma.notification
      .create({
        data: {
          userId: booking.hostId,
          type: 'BOOKING_CANCELLED',
          title: 'Reservation Cancelled',
          description: `You cancelled booking ${booking.bookingRef}. Inventory has been reopened and the guest has received a full refund.${penaltyFeeNgwee > 0 ? ` Penalty fee: ZMW ${(penaltyFeeNgwee / 100).toFixed(2)}.` : ''}`,
        },
      })
      .catch(() => null);

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
      data: {
        status,
        expiresAt: status === 'CONFIRMED' ? null : booking.expiresAt,
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

    const guest = await this.prisma.user.findUnique({
      where: { id: booking.guestId },
    });
    await this.notifications.sendBookingStatusUpdate(
      guest!.email,
      guest!.name,
      booking.bookingRef,
      status,
    );

    return formatBooking(updated);
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
    if (
      booking.hostId !== userId &&
      booking.property.hostId !== userId &&
      user?.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Only the host of this property can perform check-in',
      );
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new BadRequestException(
        'Cannot check in a cancelled or expired booking',
      );
    }

    if (booking.stayBooking?.checkedInAt || booking.status === 'CHECKED_IN') {
      throw new BadRequestException('This booking has already been checked in');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('This booking has already completed');
    }

    if (booking.paymentStatus !== 'PAID' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Booking cannot be checked in until payment is confirmed',
      );
    }

    // Step 1: Notify Guest to confirm check-in
    await this.prisma.notification
      .create({
        data: {
          userId: booking.guestId,
          type: 'CHECKED_IN',
          title: 'Check-in Confirmation Requested',
          description: `Host for ${booking.property.name} requested check-in for booking ${booking.bookingRef}. Please confirm your check-in. If not confirmed, it will auto-confirm in 24 hours.`,
          actionUrl: `/bookings/${booking.id}/confirm-check-in`,
          actionLabel: 'Confirm Check-In',
        },
      })
      .catch(() => null);

    return {
      message:
        'Check-in initiated. Waiting for guest confirmation. Auto-confirm scheduled in 24 hours.',
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      checkInPending: true,
      autoConfirmHours: 24,
    };
  }

  async confirmCheckIn(
    idOrBookingRef: string,
    userId?: string,
    isAutoConfirm: boolean = false,
  ) {
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
      if (
        booking.guestId !== userId &&
        user?.role !== 'ADMIN' &&
        user?.role !== 'SUPER_ADMIN'
      ) {
        throw new ForbiddenException(
          'Only the guest of this booking can confirm check-in',
        );
      }
    }

    if (booking.stayBooking?.checkedInAt || booking.status === 'CHECKED_IN') {
      return {
        message: 'This booking has already been checked in',
        booking: formatBooking(booking),
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
          method:
            (booking.host as any)?.hostProfile?.payoutMethod || 'BANK_TRANSFER',
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
    await this.prisma.notification
      .create({
        data: {
          userId: booking.hostId,
          type: 'PAYOUT',
          title: 'Payout Released',
          description: `Check-in confirmed for booking ${booking.bookingRef}${isAutoConfirm ? ' (24h auto-confirm)' : ''}. Funds of ZMW ${(netAmount / 100).toFixed(2)} have been released.`,
        },
      })
      .catch(() => null);

    // Notify Guest about check-in completion
    await this.prisma.notification
      .create({
        data: {
          userId: booking.guestId,
          type: 'CHECKED_IN',
          title: 'Check-in Complete',
          description: `You are confirmed checked in to ${booking.property.name}. Enjoy your stay!`,
        },
      })
      .catch(() => null);

    return {
      message: isAutoConfirm
        ? 'Check-in auto-confirmed after 24 hours. Payout released to host.'
        : 'Check-in confirmed successfully. Payout has been released to host.',
      booking: formatBooking(updated),
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
    if (
      booking.hostId !== userId &&
      booking.property.hostId !== userId &&
      user?.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Only the host of this property can perform check-out',
      );
    }

    if (booking.status === 'COMPLETED' || booking.stayBooking?.checkedOutAt) {
      throw new BadRequestException(
        'This booking has already been checked out',
      );
    }

    if (!booking.stayBooking?.checkedInAt && booking.status !== 'CHECKED_IN') {
      throw new BadRequestException(
        'Booking must be checked in before checkout',
      );
    }

    const checkedOutAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      if (booking.stayBooking) {
        await tx.stayBooking.update({
          where: { bookingId: booking.id },
          data: { checkedOutAt },
        });
      }

      const upd = await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'COMPLETED' },
        include: {
          property: true,
          stayBooking: true,
          experienceBooking: true,
          transportBooking: true,
          guest: true,
          payout: true,
        },
      });

      // Restore inventory since the unit is now free after checkout
      await this.restoreInventoryForBooking(tx, upd);
      await this.syncPropertyStatus(tx, booking.propertyId);
      return upd;
    });

    // Notify Guest
    await this.prisma.notification
      .create({
        data: {
          userId: booking.guestId,
          type: 'CHECKED_OUT',
          title: 'Check-out Completed',
          description: `Thank you for staying at ${booking.property.name}. Your checkout has been completed.`,
        },
      })
      .catch(() => null);

    // Create Zoho invoice and email it to the guest
    await this.notifications
      .sendInvoiceAfterCheckout(updated)
      .catch((err: Error) =>
        this.logger.error(
          `Zoho invoice dispatch failed after checkout: ${err.message}`,
        ),
      );

    await this.readStore.enqueueSync(booking.propertyId).catch(() => null);

    return {
      message:
        'Check-out completed successfully. Inventory has been reopened and is immediately available.',
      booking: formatBooking(updated),
    };
  }

  // ─── Inventory Restoration & Property Status Sync Helpers ───────────────────

  /**
   * Restores inventory for a booking based on its type (stay, experience, transport).
   * Must be called within a $transaction (tx) so the restore + status sync are atomic.
   */
  private async restoreInventoryForBooking(
    tx: any,
    booking: any,
  ): Promise<void> {
    if (booking.stayBooking) {
      const sb = await tx.stayBooking.findUnique({
        where: { bookingId: booking.id },
        include: { stayInventory: true },
      });
      if (sb && sb.stayInventory) {
        await tx.stayInventory.update({
          where: { id: sb.stayInventory.id },
          data: { booked: { decrement: 1 }, available: { increment: 1 } },
        });
      }
    } else if (booking.experienceBooking) {
      const eb = await tx.experienceBooking.findUnique({
        where: { bookingId: booking.id },
        include: { experienceSlot: true },
      });
      if (eb && eb.experienceSlot) {
        await tx.experienceSlot.update({
          where: { id: eb.experienceSlot.id },
          data: {
            booked: { decrement: eb.guests },
            available: { increment: eb.guests },
          },
        });
      }
    } else if (booking.transportBooking) {
      const tb = await tx.transportBooking.findUnique({
        where: { bookingId: booking.id },
        include: { transportInventory: true },
      });
      if (tb && tb.transportInventory) {
        await tx.transportInventory.update({
          where: { id: tb.transportInventory.id },
          data: {
            booked: { decrement: tb.seats },
            available: { increment: tb.seats },
          },
        });
      }
    }
  }

  /**
   * Syncs the property status based on remaining available inventory.
   * - If all inventory units have 0 available → BOOKED
   * - If at least one unit has available > 0 → ACTIVE
   * Must be called within a $transaction (tx).
   */
  private async syncPropertyStatus(tx: any, propertyId: string): Promise<void> {
    const property = await tx.property.findUnique({
      where: { id: propertyId },
      include: {
        stays: {
          where: { deletedAt: null },
          include: { inventory: true },
        },
        experiences: {
          where: { deletedAt: null },
          include: { slots: true },
        },
        transports: {
          where: { deletedAt: null },
          include: { inventory: true },
        },
      },
    });

    if (!property || property.deletedAt) return;

    let totalAvailable = 0;
    let totalUnits = 0;

    if (property.type === 'STAY') {
      for (const stay of property.stays) {
        const inventories = stay.inventory || [];
        for (const inv of inventories) {
          totalUnits++;
          totalAvailable += inv.available;
        }
      }
    } else if (property.type === 'EXPERIENCE') {
      for (const exp of property.experiences) {
        const slots = exp.slots || [];
        for (const slot of slots) {
          totalUnits++;
          totalAvailable += slot.available;
        }
      }
    } else if (property.type === 'TRANSPORT') {
      for (const trans of property.transports) {
        const inventories = trans.inventory || [];
        for (const inv of inventories) {
          totalUnits++;
          totalAvailable += inv.available;
        }
      }
    }

    if (
      totalUnits > 0 &&
      totalAvailable === 0 &&
      property.status !== PropertyStatus.BOOKED
    ) {
      await tx.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.BOOKED },
      });
    } else if (
      totalAvailable > 0 &&
      property.status === PropertyStatus.BOOKED
    ) {
      await tx.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.ACTIVE },
      });
    }
  }

  // ─── Scheduled Job: Auto-Expire PENDING Holds ──────────────────────────────────

  /**
   * Runs every minute to find PENDING bookings whose 10-minute hold has expired,
   * marks them as EXPIRED, restores inventory, and syncs property status.
   */
  @Cron('*/60 * * * * *', {
    name: 'expire-pending-holds',
  })
  async handleExpiredHolds() {
    this.logger.log('⏰ Checking for expired PENDING holds...');
    const now = new Date();

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: now },
      },
      include: {
        stayBooking: true,
        experienceBooking: true,
        transportBooking: true,
      },
    });

    if (expiredBookings.length === 0) {
      this.logger.log('✅ No expired holds found.');
      return;
    }

    this.logger.log(
      `⏳ Found ${expiredBookings.length} expired hold(s). Processing...`,
    );

    const processed: string[] = [];
    const errored: string[] = [];

    for (const booking of expiredBookings) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: 'EXPIRED', expiresAt: null },
          });

          await this.restoreInventoryForBooking(tx, booking);
          await this.syncPropertyStatus(tx, booking.propertyId);
        });

        await this.readStore.enqueueSync(booking.propertyId).catch(() => null);
        processed.push(booking.bookingRef);
      } catch (err: any) {
        this.logger.error(
          `Failed to expire hold for booking ${booking.bookingRef}: ${err.message}`,
          err.stack,
        );
        errored.push(booking.bookingRef);
      }
    }

    this.logger.log(
      `✅ Expired ${processed.length} hold(s). Failures: ${errored.length}.`,
    );
  }
}
