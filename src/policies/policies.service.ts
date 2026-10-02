import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PolicyType, Prisma } from '@prisma/client';
import {
  CreatePolicyDto,
  CreatePolicyVersionDto,
  PolicyTypeEnum,
  UpdatePolicyDto,
} from './dto/policy.dto';

function mapCategoryToPolicyType(category?: string, explicitType?: any): PolicyType {
  if (explicitType && Object.values(PolicyType).includes(explicitType)) {
    return explicitType as PolicyType;
  }
  if (!category) return PolicyType.OTHER;
  switch (category.toLowerCase()) {
    case 'legal':
      return PolicyType.TERMS_OF_SERVICE;
    case 'guest_protection':
      return PolicyType.REFUND_POLICY;
    case 'host_standards':
      return PolicyType.HOST_STANDARDS;
    case 'safety_security':
      return PolicyType.TRUST_SAFETY;
    case 'fee_structure':
      return PolicyType.OTHER;
    default:
      return PolicyType.OTHER;
  }
}

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Admin Methods ──────────────────────────────────────────────────────────

  async createPolicy(dto: CreatePolicyDto, adminId?: string) {
    const existing = await this.prisma.policy.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Policy with slug "${dto.slug}" already exists`);
    }

    const versionStr = dto.version?.trim() || '1.0.0';
    const policyType = mapCategoryToPolicyType(dto.category, dto.type);
    const content = dto.contentMarkdown || dto.content || '';
    const summary = dto.summaryOfChanges || dto.summary || 'Initial version';
    const isPublished = dto.status === 'published' || dto.isPublished === true;
    const effectiveDate = dto.effectiveDate ? new Date(dto.effectiveDate) : new Date();

    let adminName = 'Admin';
    if (adminId) {
      const adminUser = await this.prisma.user.findUnique({
        where: { id: adminId },
        select: { id: true, name: true, email: true },
      });
      if (adminUser) {
        adminName = adminUser.name || adminUser.email || 'Admin';
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const policy = await tx.policy.create({
        data: {
          slug: dto.slug,
          title: dto.title,
          type: policyType,
          description: dto.description || null,
          isPublished,
          currentVersion: versionStr,
          createdById: adminId || null,
        },
      });

      const initialVersion = await tx.policyVersion.create({
        data: {
          policyId: policy.id,
          version: versionStr,
          content,
          summary,
          documentUrl: dto.documentUrl || null,
          metadata: dto.metadata || undefined,
          effectiveDate,
          createdById: adminId || null,
        },
      });

      const responseData = {
        id: policy.id,
        slug: policy.slug,
        title: policy.title,
        category: dto.category || policy.type.toLowerCase(),
        version: versionStr,
        status: isPublished ? 'published' : 'draft',
        summaryOfChanges: summary,
        contentMarkdown: content,
        effectiveDate: effectiveDate.toISOString(),
        updatedByAdminId: adminId || 'admin',
        updatedByAdminName: adminName,
        createdAt: policy.createdAt.toISOString(),
        updatedAt: policy.updatedAt.toISOString(),
      };

      return {
        success: true,
        data: responseData,
        ...responseData,
        type: policy.type.toLowerCase(),
        isPublished: policy.isPublished,
        currentVersion: versionStr,
      };
    });
  }

  async updatePolicyBySlugOrId(slugOrId: string, dto: UpdatePolicyDto, adminId?: string) {
    const policy = await this.prisma.policy.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        deletedAt: null,
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy "${slugOrId}" not found`);
    }

    const versionStr = dto.version?.trim() || policy.currentVersion;
    const content = dto.contentMarkdown || dto.content;
    const summary = dto.summaryOfChanges || dto.summary;
    const effectiveDate = dto.effectiveDate ? new Date(dto.effectiveDate) : new Date();

    const isPublished =
      dto.status === 'published'
        ? true
        : dto.status === 'draft' || dto.status === 'archived'
        ? false
        : dto.isPublished !== undefined
        ? dto.isPublished
        : policy.isPublished;

    return this.prisma.$transaction(async (tx) => {
      if (content !== undefined) {
        await tx.policyVersion.upsert({
          where: {
            policyId_version: {
              policyId: policy.id,
              version: versionStr,
            },
          },
          update: {
            content,
            summary: summary || undefined,
            effectiveDate,
            createdById: adminId || null,
          },
          create: {
            policyId: policy.id,
            version: versionStr,
            content,
            summary: summary || 'Updated version',
            effectiveDate,
            createdById: adminId || null,
          },
        });
      }

      const updatedPolicy = await tx.policy.update({
        where: { id: policy.id },
        data: {
          currentVersion: versionStr,
          isPublished,
          ...(dto.title ? { title: dto.title } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.type || dto.category ? { type: mapCategoryToPolicyType(dto.category as any, dto.type) } : {}),
        },
      });

      const responseData = {
        slug: updatedPolicy.slug,
        version: versionStr,
        status: isPublished ? 'published' : 'draft',
        effectiveDate: effectiveDate.toISOString(),
        updatedAt: updatedPolicy.updatedAt.toISOString(),
      };

      return {
        success: true,
        data: responseData,
        ...responseData,
        id: updatedPolicy.id,
        title: updatedPolicy.title,
        type: updatedPolicy.type.toLowerCase(),
      };
    });
  }

  async createVersion(policyId: string, dto: CreatePolicyVersionDto, adminId?: string) {
    const policy = await this.prisma.policy.findFirst({
      where: { id: policyId, deletedAt: null },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID "${policyId}" not found`);
    }

    const versionStr = dto.version.trim();
    const existingVersion = await this.prisma.policyVersion.findUnique({
      where: {
        policyId_version: {
          policyId,
          version: versionStr,
        },
      },
    });

    if (existingVersion) {
      throw new ConflictException(
        `Version "${versionStr}" already exists for policy "${policy.slug}"`,
      );
    }

    const setAsCurrent = dto.setAsCurrent ?? true;
    const content = dto.contentMarkdown || dto.content || '';
    const summary = dto.summaryOfChanges || dto.summary || null;

    return this.prisma.$transaction(async (tx) => {
      const version = await tx.policyVersion.create({
        data: {
          policyId,
          version: versionStr,
          content,
          summary,
          documentUrl: dto.documentUrl || null,
          metadata: dto.metadata || undefined,
          effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
          createdById: adminId || null,
        },
      });

      if (setAsCurrent) {
        await tx.policy.update({
          where: { id: policyId },
          data: { currentVersion: versionStr },
        });
      }

      const updatedPolicy = await tx.policy.findUniqueOrThrow({
        where: { id: policyId },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          versions: { orderBy: { createdAt: 'desc' } },
        },
      });

      return {
        ...updatedPolicy,
        type: updatedPolicy.type.toLowerCase(),
        latestVersion: version,
      };
    });
  }

  async updatePolicy(id: string, dto: UpdatePolicyDto) {
    return this.updatePolicyBySlugOrId(id, dto);
  }

  async setPublishStatus(id: string, isPublished: boolean) {
    const policy = await this.prisma.policy.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID or slug "${id}" not found`);
    }

    const updated = await this.prisma.policy.update({
      where: { id: policy.id },
      data: { isPublished },
      select: { id: true, slug: true, title: true, isPublished: true, currentVersion: true },
    });

    return {
      ...updated,
      message: `Policy ${isPublished ? 'published' : 'unpublished'} successfully`,
    };
  }

  async deletePolicy(id: string) {
    const policy = await this.prisma.policy.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID or slug "${id}" not found`);
    }

    // Soft delete
    await this.prisma.policy.update({
      where: { id: policy.id },
      data: { deletedAt: new Date(), isPublished: false },
    });

    return { id: policy.id, deleted: true, message: `Policy "${policy.title}" archived successfully` };
  }

  async getAdminPolicies(query: {
    type?: PolicyTypeEnum;
    search?: string;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.PolicyWhereInput = {
      deletedAt: null,
      ...(query.type ? { type: query.type as unknown as PolicyType } : {}),
      ...(query.isPublished !== undefined ? { isPublished: query.isPublished } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [policies, total] = await Promise.all([
      this.prisma.policy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { versions: true } },
        },
      }),
      this.prisma.policy.count({ where }),
    ]);

    return {
      data: policies.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type.toLowerCase(),
        description: p.description,
        isPublished: p.isPublished,
        currentVersion: p.currentVersion,
        versionsCount: p._count.versions,
        createdBy: p.createdBy,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminPolicyById(id: string) {
    const policy = await this.prisma.policy.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy "${id}" not found`);
    }

    return {
      ...policy,
      type: policy.type.toLowerCase(),
    };
  }

  // ─── Public Read Methods ────────────────────────────────────────────────────

  async getPublishedPolicies(type?: PolicyTypeEnum) {
    const policies = await this.prisma.policy.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        ...(type ? { type: type as unknown as PolicyType } : {}),
      },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        description: true,
        currentVersion: true,
        updatedAt: true,
      },
    });

    return policies.map((p) => ({
      ...p,
      type: p.type.toLowerCase(),
    }));
  }

  async getPolicyBySlug(slug: string) {
    const policy = await this.prisma.policy.findFirst({
      where: {
        slug,
        deletedAt: null,
        isPublished: true,
      },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with slug "${slug}" not found or not published`);
    }

    // Pick current version, or fallback to the latest
    const activeVersion =
      policy.versions.find((v) => v.version === policy.currentVersion) || policy.versions[0];

    const responseData = {
      slug: policy.slug,
      title: policy.title,
      version: activeVersion?.version || policy.currentVersion,
      contentMarkdown: activeVersion?.content || '',
      effectiveDate: (activeVersion?.effectiveDate || policy.updatedAt).toISOString(),
      lastUpdated: policy.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: responseData,
      id: policy.id,
      slug: policy.slug,
      title: policy.title,
      type: policy.type.toLowerCase(),
      description: policy.description,
      currentVersion: policy.currentVersion,
      effectiveDate: activeVersion?.effectiveDate || policy.updatedAt,
      content: activeVersion?.content || '',
      summary: activeVersion?.summary || null,
      documentUrl: activeVersion?.documentUrl || null,
      metadata: activeVersion?.metadata || null,
      updatedAt: policy.updatedAt,
      availableVersions: policy.versions.map((v) => ({
        version: v.version,
        effectiveDate: v.effectiveDate,
        summary: v.summary,
      })),
    };
  }
}
