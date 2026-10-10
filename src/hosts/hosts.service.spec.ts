import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HostsService - Onboarding validation', () => {
  let service: HostsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      hostApplication: {
        upsert: jest.fn(),
      },
      hostProfile: {
        upsert: jest.fn(),
      },
    };
    service = new HostsService(prisma as PrismaService);
  });

  it('should throw BadRequestException if total documents exceed 10', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user_1' });

    const dto = {
      businessName: 'Safari Lodge Ltd',
      pacraDocs: [1, 2, 3, 4],
      ownershipDocs: [5, 6, 7, 8],
      otherDocs: [9, 10, 11], // Total = 11 docs!
    };

    await expect(service.submitApplication('user_1', dto as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should accept applications with up to 10 supporting documents including otherDocs', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user_1' });
    prisma.hostApplication.upsert.mockResolvedValue({
      id: 'app_1',
      userId: 'user_1',
      businessName: 'Safari Lodge Ltd',
      status: 'pending_review',
      createdAt: new Date(),
    });
    prisma.hostProfile.upsert.mockResolvedValue({ id: 'prof_1' });

    const dto = {
      businessName: 'Safari Lodge Ltd',
      pacraDocs: [{ name: 'pacra.pdf' }],
      ownershipDocs: [{ name: 'title.pdf' }],
      otherDocs: [{ name: 'other_permit.pdf' }], // Total = 3 docs
    };

    const result = await service.submitApplication('user_1', dto as any);
    expect(result.applicationId).toBe('app_1');
    expect(result.status).toBe('pending_review');
  });
});
