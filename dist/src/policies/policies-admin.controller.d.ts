import { PoliciesService } from './policies.service';
import type { User } from '@prisma/client';
import { CreatePolicyDto, CreatePolicyVersionDto, PolicyTypeEnum, UpdatePolicyDto } from './dto/policy.dto';
export declare class PoliciesAdminController {
    private readonly policiesService;
    constructor(policiesService: PoliciesService);
    findAll(type?: PolicyTypeEnum, search?: string, isPublished?: string, page?: string, limit?: string): Promise<{
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
    findOne(id: string): Promise<{
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
    create(dto: CreatePolicyDto, user: User): Promise<{
        type: string;
        currentVersionData: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            policyId: string;
            version: string;
            content: string;
            summary: string | null;
            documentUrl: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            effectiveDate: Date;
        };
        versions: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            policyId: string;
            version: string;
            content: string;
            summary: string | null;
            documentUrl: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
    update(id: string, dto: UpdatePolicyDto): Promise<{
        type: string;
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
    createVersion(id: string, dto: CreatePolicyVersionDto, user: User): Promise<{
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
    setPublishStatus(id: string, isPublished: boolean): Promise<{
        message: string;
        id: string;
        slug: string;
        title: string;
        isPublished: boolean;
        currentVersion: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
        message: string;
    }>;
}
