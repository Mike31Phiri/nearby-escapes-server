import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePolicyDto, CreatePolicyVersionDto, PolicyTypeEnum, UpdatePolicyDto } from './dto/policy.dto';
export declare class PoliciesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createPolicy(dto: CreatePolicyDto, adminId?: string): Promise<{
        type: string;
        isPublished: boolean;
        currentVersion: string;
        id: string;
        slug: string;
        title: string;
        category: string;
        version: string;
        status: string;
        summaryOfChanges: string;
        contentMarkdown: string;
        effectiveDate: string;
        updatedByAdminId: string;
        updatedByAdminName: string;
        createdAt: string;
        updatedAt: string;
        success: boolean;
        data: {
            id: string;
            slug: string;
            title: string;
            category: string;
            version: string;
            status: string;
            summaryOfChanges: string;
            contentMarkdown: string;
            effectiveDate: string;
            updatedByAdminId: string;
            updatedByAdminName: string;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    updatePolicyBySlugOrId(slugOrId: string, dto: UpdatePolicyDto, adminId?: string): Promise<{
        id: string;
        title: string;
        type: string;
        slug: string;
        version: string;
        status: string;
        effectiveDate: string;
        updatedAt: string;
        success: boolean;
        data: {
            slug: string;
            version: string;
            status: string;
            effectiveDate: string;
            updatedAt: string;
        };
    }>;
    createVersion(policyId: string, dto: CreatePolicyVersionDto, adminId?: string): Promise<{
        type: string;
        latestVersion: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            policyId: string;
            version: string;
            content: string;
            summary: string | null;
            documentUrl: string | null;
            metadata: Prisma.JsonValue | null;
            effectiveDate: Date;
        };
        createdBy: {
            id: string;
            email: string;
            name: string;
        } | null;
        versions: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            policyId: string;
            version: string;
            content: string;
            summary: string | null;
            documentUrl: string | null;
            metadata: Prisma.JsonValue | null;
            effectiveDate: Date;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        title: string;
        description: string | null;
        isPublished: boolean;
        currentVersion: string;
        createdById: string | null;
    }>;
    updatePolicy(id: string, dto: UpdatePolicyDto): Promise<{
        id: string;
        title: string;
        type: string;
        slug: string;
        version: string;
        status: string;
        effectiveDate: string;
        updatedAt: string;
        success: boolean;
        data: {
            slug: string;
            version: string;
            status: string;
            effectiveDate: string;
            updatedAt: string;
        };
    }>;
    setPublishStatus(id: string, isPublished: boolean): Promise<{
        message: string;
        id: string;
        slug: string;
        title: string;
        isPublished: boolean;
        currentVersion: string;
    }>;
    deletePolicy(id: string): Promise<{
        id: string;
        deleted: boolean;
        message: string;
    }>;
    getAdminPolicies(query: {
        type?: PolicyTypeEnum;
        search?: string;
        isPublished?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            slug: string;
            title: string;
            type: string;
            description: string | null;
            isPublished: boolean;
            currentVersion: string;
            versionsCount: number;
            createdBy: {
                id: string;
                email: string;
                name: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAdminPolicyById(id: string): Promise<{
        type: string;
        createdBy: {
            id: string;
            email: string;
            name: string;
        } | null;
        versions: ({
            createdBy: {
                id: string;
                email: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            createdById: string | null;
            policyId: string;
            version: string;
            content: string;
            summary: string | null;
            documentUrl: string | null;
            metadata: Prisma.JsonValue | null;
            effectiveDate: Date;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        title: string;
        description: string | null;
        isPublished: boolean;
        currentVersion: string;
        createdById: string | null;
    }>;
    getPublishedPolicies(type?: PolicyTypeEnum): Promise<{
        type: string;
        id: string;
        updatedAt: Date;
        slug: string;
        title: string;
        description: string | null;
        currentVersion: string;
    }[]>;
    getPolicyBySlug(slug: string): Promise<{
        success: boolean;
        data: {
            slug: string;
            title: string;
            version: string;
            contentMarkdown: string;
            effectiveDate: string;
            lastUpdated: string;
        };
        id: string;
        slug: string;
        title: string;
        type: string;
        description: string | null;
        currentVersion: string;
        effectiveDate: Date;
        content: string;
        summary: string | null;
        documentUrl: string | null;
        metadata: string | number | true | Prisma.JsonObject | Prisma.JsonArray | null;
        updatedAt: Date;
        availableVersions: {
            version: string;
            effectiveDate: Date;
            summary: string | null;
        }[];
    }>;
}
