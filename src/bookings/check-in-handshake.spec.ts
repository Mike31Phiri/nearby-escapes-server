import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BookingsService - 2-Step Check-In Handshake', () => {
  let service: BookingsService;
  let prisma: any;
  let notifications: any;
  let readStore: any;

  beforeEach(() => {
    prisma = {
      booking: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      notification: {
        create: jest.fn().mockResolvedValue({ id: 'notif_1' }),
      },
      payout: {
        create: jest.fn(),
      },
    };
    notifications = {
      sendBookingStatusUpdate: jest.fn(),
    };
    readStore = {
      enqueueSync: jest.fn(),
    };

    service = new BookingsService(
      prisma as PrismaService,
      notifications as any,
      readStore as any,
    );
  });

  const mockBooking = {
    id: 'b_123',
    bookingRef: 'NE-2026-0001',
    propertyId: 'prop_1',
    guestId: 'guest_1',
    hostId: 'host_1',
    amount: 100000, // ZMW 1,000.00 in ngwee
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    property: { name: 'Zambezi River Sun Lodge', hostId: 'host_1' },
    host: { id: 'host_1', hostProfile: { payoutMethod: 'BANK_TRANSFER' } },
    checkedInAt: null,
    payout: null,
  };

  it('Step 1: Host initiates check-in, creates notification for guest and returns pending', async () => {
    prisma.booking.findFirst.mockResolvedValue(mockBooking);
    prisma.user.findUnique.mockResolvedValue({ id: 'host_1', role: 'HOST' });

    const result = await service.checkIn('b_123', 'host_1');

    expect(result.checkInPending).toBe(true);
    expect(result.autoConfirmHours).toBe(24);
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'guest_1',
          type: 'CHECKED_IN',
          actionUrl: '/bookings/b_123/confirm-check-in',
        }),
      }),
    );
  });

  it('Step 2: Guest confirms check-in, updates status to CHECKED_IN and releases payout', async () => {
    prisma.booking.findFirst.mockResolvedValue(mockBooking);
    prisma.user.findUnique.mockResolvedValue({ id: 'guest_1', role: 'GUEST' });
    prisma.payout.create.mockResolvedValue({
      id: 'payout_1',
      amount: 100000,
      commission: 15000,
      netAmount: 85000,
      status: 'PROCESSING',
      method: 'BANK_TRANSFER',
    });
    prisma.booking.update.mockResolvedValue({
      ...mockBooking,
      status: 'CHECKED_IN',
      checkedInAt: new Date(),
    });

    const result = await service.confirmCheckIn('b_123', 'guest_1');

    expect(result.payout!.netAmount).toBe(85000);
    expect(result.payout!.commission).toBe(15000);
    expect(prisma.payout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hostId: 'host_1',
          amount: 100000,
          commission: 15000,
          netAmount: 85000,
        }),
      }),
    );
  });

  it('24h Fallback: Auto-confirm triggers without guest userId and releases payout', async () => {
    prisma.booking.findFirst.mockResolvedValue(mockBooking);
    prisma.payout.create.mockResolvedValue({
      id: 'payout_auto',
      amount: 100000,
      commission: 15000,
      netAmount: 85000,
      status: 'PROCESSING',
      method: 'BANK_TRANSFER',
    });
    prisma.booking.update.mockResolvedValue({
      ...mockBooking,
      status: 'CHECKED_IN',
      checkedInAt: new Date(),
    });

    const result = await service.confirmCheckIn('b_123', undefined, true);

    expect(result.message).toContain('auto-confirmed after 24 hours');
    expect(result.payout!.netAmount).toBe(85000);
  });
});
