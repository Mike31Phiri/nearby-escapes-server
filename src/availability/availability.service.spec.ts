import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AvailabilityService date blocks', () => {
  let service: AvailabilityService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      stay: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      stayBooking: {
        findMany: jest.fn(),
      },
      stayInventory: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      stayDateBlock: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({
          hostProfile: {
            defaultCheckInTime: '14:00',
            defaultCheckOutTime: '10:00',
          },
        }),
      },
    };
    service = new AvailabilityService(prisma as PrismaService);
  });

  it('persists inclusive date blocks without changing inventory status', async () => {
    prisma.stay.findUnique.mockResolvedValue({
      id: 'stay_1',
      property: { hostId: 'host_1' },
    });
    prisma.stayDateBlock.createMany.mockResolvedValue({ count: 1 });

    const result = await service.blockDates(
      {
        stayId: 'stay_1',
        startDate: '2026-10-18',
        endDate: '2026-10-20',
        reason: 'Offline booking',
      },
      'host_1',
    );

    expect(result).toMatchObject({
      success: true,
      startDate: '2026-10-18',
      endDate: '2026-10-20',
      reason: 'Offline booking',
    });
    expect(prisma.stayDateBlock.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          blockGroupId: result.blockedRangeId,
          stayId: 'stay_1',
          startDate: new Date('2026-10-18T00:00:00.000Z'),
          endDate: new Date('2026-10-20T00:00:00.000Z'),
          checkInAt: new Date('2026-10-18T12:00:00.000Z'),
          checkOutAt: new Date('2026-10-20T08:00:00.000Z'),
          reason: 'Offline booking',
          createdById: 'host_1',
        }),
      ],
    });
    expect(prisma.stayInventory.updateMany).not.toHaveBeenCalled();
  });

  it('rejects invalid or reversed date ranges', async () => {
    await expect(
      service.blockDates(
        { stayId: 'stay_1', startDate: '2026-10-21', endDate: '2026-10-20' },
        'host_1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.stay.findUnique).not.toHaveBeenCalled();
  });

  it('marks ended blocks completed after their inclusive end date', async () => {
    prisma.stayDateBlock.updateMany.mockResolvedValue({ count: 2 });

    await expect(service.completeExpiredDateBlocks()).resolves.toBe(2);

    expect(prisma.stayDateBlock.updateMany).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        checkOutAt: { lte: expect.any(Date) },
      },
      data: {
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      },
    });
  });

  it('only marks calendar days inside the inclusive block range unavailable', async () => {
    prisma.stay.findUnique.mockResolvedValue({
      id: 'stay_1',
      propertyId: 'property_1',
      property: {},
    });
    prisma.stayBooking.findMany.mockResolvedValue([]);
    prisma.stayInventory.findMany.mockResolvedValue([]);
    prisma.stayDateBlock.findMany.mockResolvedValue([
      {
        startDate: new Date('2026-10-19T00:00:00.000Z'),
        endDate: new Date('2026-10-20T00:00:00.000Z'),
        checkInAt: null,
        checkOutAt: null,
      },
    ]);

    const days = await service.getStayAvailability('stay_1', 2026, 10);
    const availabilityByDate = new Map(
      days.map((day: any) => [day.date, day.available]),
    );

    expect(availabilityByDate.get('2026-10-18')).toBe(true);
    expect(availabilityByDate.get('2026-10-19')).toBe(false);
    expect(availabilityByDate.get('2026-10-20')).toBe(false);
    expect(availabilityByDate.get('2026-10-21')).toBe(true);
  });

  it('leaves maintenance blocks active without a checkout time for manual release', async () => {
    prisma.stay.findUnique.mockResolvedValue({
      id: 'stay_1',
      property: { hostId: 'host_1' },
    });

    const result = await service.blockDates(
      {
        stayId: 'stay_1',
        startDate: '2026-10-18',
        endDate: '2026-10-20',
        reason: 'Maintenance',
      },
      'host_1',
    );

    expect(result.checkInAt).toBeNull();
    expect(result.checkOutAt).toBeNull();
    expect(prisma.stayDateBlock.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          reason: 'Maintenance',
          checkInAt: null,
          checkOutAt: null,
        }),
      ],
    });
  });

  it('cancels the matching active block and errors when there is none', async () => {
    prisma.stay.findUnique.mockResolvedValue({
      id: 'stay_1',
      property: { hostId: 'host_1' },
    });
    prisma.stayDateBlock.updateMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      service.unblockDates(
        { stayId: 'stay_1', startDate: '2026-10-18', endDate: '2026-10-20' },
        'host_1',
      ),
    ).resolves.toMatchObject({ success: true });

    expect(prisma.stayDateBlock.updateMany).toHaveBeenCalledWith({
      where: {
        stayId: { in: ['stay_1'] },
        startDate: new Date('2026-10-18T00:00:00.000Z'),
        endDate: new Date('2026-10-20T00:00:00.000Z'),
        status: 'ACTIVE',
      },
      data: { status: 'CANCELLED' },
    });

    prisma.stayDateBlock.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(
      service.unblockDates(
        { stayId: 'stay_1', startDate: '2026-10-18', endDate: '2026-10-20' },
        'host_1',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
