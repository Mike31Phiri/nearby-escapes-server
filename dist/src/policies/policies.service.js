"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PoliciesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PoliciesService = PoliciesService_1 = class PoliciesService {
    prisma;
    logger = new common_1.Logger(PoliciesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPolicy(dto, adminId) {
        const existing = await this.prisma.policy.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`Policy with slug "${dto.slug}" already exists`);
        }
        const versionStr = dto.version?.trim() || '1.0.0';
        return this.prisma.$transaction(async (tx) => {
            const policy = await tx.policy.create({
                data: {
                    slug: dto.slug,
                    title: dto.title,
                    type: dto.type,
                    description: dto.description || null,
                    isPublished: dto.isPublished ?? false,
                    currentVersion: versionStr,
                    createdById: adminId || null,
                },
            });
            const initialVersion = await tx.policyVersion.create({
                data: {
                    policyId: policy.id,
                    version: versionStr,
                    content: dto.content,
                    summary: dto.summary || 'Initial version',
                    documentUrl: dto.documentUrl || null,
                    metadata: dto.metadata || undefined,
                    effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
                    createdById: adminId || null,
                },
            });
            return {
                ...policy,
                type: policy.type.toLowerCase(),
                currentVersionData: initialVersion,
                versions: [initialVersion],
            };
        });
    }
    async createVersion(policyId, dto, adminId) {
        const policy = await this.prisma.policy.findFirst({
            where: { id: policyId, deletedAt: null },
        });
        if (!policy) {
            throw new common_1.NotFoundException(`Policy with ID "${policyId}" not found`);
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
            throw new common_1.ConflictException(`Version "${versionStr}" already exists for policy "${policy.slug}"`);
        }
        const setAsCurrent = dto.setAsCurrent ?? true;
        return this.prisma.$transaction(async (tx) => {
            const version = await tx.policyVersion.create({
                data: {
                    policyId,
                    version: versionStr,
                    content: dto.content,
                    summary: dto.summary || null,
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
    async updatePolicy(id, dto) {
        const policy = await this.prisma.policy.findFirst({
            where: { id, deletedAt: null },
        });
        if (!policy) {
            throw new common_1.NotFoundException(`Policy with ID "${id}" not found`);
        }
        const updated = await this.prisma.policy.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.type !== undefined ? { type: dto.type } : {}),
                ...(dto.isPublished !== undefined ? { isPublished: dto.isPublished } : {}),
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                versions: { orderBy: { createdAt: 'desc' } },
            },
        });
        return {
            ...updated,
            type: updated.type.toLowerCase(),
        };
    }
    async setPublishStatus(id, isPublished) {
        const policy = await this.prisma.policy.findFirst({
            where: { id, deletedAt: null },
        });
        if (!policy) {
            throw new common_1.NotFoundException(`Policy with ID "${id}" not found`);
        }
        const updated = await this.prisma.policy.update({
            where: { id },
            data: { isPublished },
            select: { id: true, slug: true, title: true, isPublished: true, currentVersion: true },
        });
        return {
            ...updated,
            message: `Policy ${isPublished ? 'published' : 'unpublished'} successfully`,
        };
    }
    async deletePolicy(id) {
        const policy = await this.prisma.policy.findFirst({
            where: { id, deletedAt: null },
        });
        if (!policy) {
            throw new common_1.NotFoundException(`Policy with ID "${id}" not found`);
        }
        await this.prisma.policy.update({
            where: { id },
            data: { deletedAt: new Date(), isPublished: false },
        });
        return { id, deleted: true, message: `Policy "${policy.title}" archived successfully` };
    }
    async getAdminPolicies(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(query.type ? { type: query.type } : {}),
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
    async getAdminPolicyById(id) {
        const policy = await this.prisma.policy.findFirst({
            where: { id, deletedAt: null },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                versions: {
                    orderBy: { createdAt: 'desc' },
                    include: { createdBy: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        if (!policy) {
            throw new common_1.NotFoundException(`Policy with ID "${id}" not found`);
        }
        return {
            ...policy,
            type: policy.type.toLowerCase(),
        };
    }
    async getPublishedPolicies(type) {
        const policies = await this.prisma.policy.findMany({
            where: {
                deletedAt: null,
                isPublished: true,
                ...(type ? { type: type } : {}),
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
    async getPolicyBySlug(slug) {
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
            throw new common_1.NotFoundException(`Policy with slug "${slug}" not found or not published`);
        }
        const activeVersion = policy.versions.find((v) => v.version === policy.currentVersion) || policy.versions[0];
        return {
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
};
exports.PoliciesService = PoliciesService;
exports.PoliciesService = PoliciesService = PoliciesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PoliciesService);
//# sourceMappingURL=policies.service.js.map