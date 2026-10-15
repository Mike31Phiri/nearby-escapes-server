import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { BookingStatus, DisputeStatus, Role } from '@prisma/client';

@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * File a dispute against a recent booking the caller is involved in.
   * "Recent" = booking is COMPLETED (checked out) or CANCELLED within the last 60 days.
   * Only the guest or host on the booking may raise a dispute.
   */
  async create(callerId: string, callerRole: Role, dto: CreateDisputeDto) {
    // Fetch the booking with full context
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        property: { select: { name: true, type: true } },
        guest: { select: { id: true, name: true } },
        host: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Caller must be the guest or host on the booking (or an admin)
    const isGuest = booking.guestId === callerId;
    const isHost = booking.hostId === callerId;
    const isAdmin = callerRole === Role.ADMIN || callerRole === Role.SUPER_ADMIN;

    if (!isGuest && !isHost && !isAdmin) {
      throw new ForbiddenException('You can only raise a dispute on your own bookings');
    }

    // Only allow disputes on "recent" bookings: COMPLETED or CANCELLED
    const eligibleStatuses: BookingStatus[] = [
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
      BookingStatus.CHECKED_IN,
    ];
    if (!eligibleStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Disputes can only be filed on completed or cancelled bookings. Current status: ${booking.status}`,
      );
    }

    // Guard against filing within 60-day window
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    if (booking.updatedAt < sixtyDaysAgo) {
      throw new BadRequestException(
        'Disputes must be filed within 60 days of the booking being completed or cancelled',
      );
    }

    // Prevent duplicate disputes on the same booking by the same user
    const existing = await this.prisma.dispute.findFirst({
      where: {
        bookingId: booking.id,
        raisedById: callerId,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'You have already filed a dispute for this booking',
      );
    }

    const callerUser = isGuest ? booking.guest : booking.host;

    const dispute = await this.prisma.dispute.create({
      data: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        propertyName: booking.property?.name ?? 'Unknown property',
        propertyType: booking.property?.type ?? 'STAY',
        guestId: booking.guestId,
        guestName: booking.guest.name,
        hostId: booking.hostId,
        hostName: booking.host.name,
        amount: booking.amount,
        reason: dto.reason,
        description: dto.description,
        raisedBy: isGuest ? 'GUEST' : isHost ? 'HOST' : 'ADMIN',
        raisedById: callerId,
        status: DisputeStatus.OPEN,
      },
      select: {
        id: true,
        bookingRef: true,
        propertyName: true,
        propertyType: true,
        reason: true,
        description: true,
        status: true,
        priority: true,
        raisedBy: true,
        raisedAt: true,
      },
    });

    this.logger.log(
      `Dispute filed: id=${dispute.id} bookingRef=${dispute.bookingRef} by ${callerId}`,
    );

    return { message: 'Dispute filed successfully. Our team will review it shortly.', dispute };
  }

  /**
   * Read-only list of disputes raised by the current user.
   * Users cannot see resolution notes or admin-only fields.
   */
  async findMine(callerId: string) {
    const disputes = await this.prisma.dispute.findMany({
      where: { raisedById: callerId },
      orderBy: { raisedAt: 'desc' },
      select: {
        id: true,
        bookingRef: true,
        propertyName: true,
        propertyType: true,
        reason: true,
        description: true,
        status: true,
        priority: true,
        raisedBy: true,
        raisedAt: true,
        // Resolution is shown to users only once resolved, not mid-investigation
        resolvedAt: true,
        resolution: true,
      },
    });

    return { total: disputes.length, disputes };
  }

  // ─── Admin-only ────────────────────────────────────────────────────────────

  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where = status ? { status: status as DisputeStatus } : {};

    const [total, disputes] = await Promise.all([
      this.prisma.dispute.count({ where }),
      this.prisma.dispute.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { raisedAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              bookingRef: true,
              stayBooking: {
                select: {
                  checkIn: true,
                  checkOut: true,
                },
              },
            },
          },
          raisedByUser: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      disputes,
    };
  }

  async update(id: string, dto: UpdateDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      throw new NotFoundException(`Dispute ${id} not found`);
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.resolution !== undefined && { resolution: dto.resolution }),
        ...(['RESOLVED_HOST', 'RESOLVED_GUEST', 'REFUNDED', 'CLOSED'].includes(dto.status)
          ? { resolvedAt: new Date() }
          : {}),
      },
    });

    this.logger.log(`Dispute ${id} updated to status=${dto.status} by admin`);
    return updated;
  }
}
