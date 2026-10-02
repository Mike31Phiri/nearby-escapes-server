import { PoliciesService } from './policies.service';
import { PolicyTypeEnum } from './dto/policy.dto';
export declare class PoliciesController {
    private readonly policiesService;
    constructor(policiesService: PoliciesService);
    getPublished(type?: PolicyTypeEnum): Promise<{
        type: string;
        id: string;
        updatedAt: Date;
        slug: string;
        title: string;
        description: string | null;
        currentVersion: string;
    }[]>;
    getBySlug(slug: string): Promise<{
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
        metadata: string | number | true | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
        updatedAt: Date;
        availableVersions: {
            version: string;
            effectiveDate: Date;
            summary: string | null;
        }[];
    }>;
}
