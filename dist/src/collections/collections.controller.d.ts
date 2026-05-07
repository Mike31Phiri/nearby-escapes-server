import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import type { User } from '@prisma/client';
export declare class CollectionsController {
    private collectionsService;
    constructor(collectionsService: CollectionsService);
    findAll(user: User): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(user: User, dto: CreateCollectionDto): import("@prisma/client").Prisma.Prisma__CollectionClient<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(user: User, id: string, dto: UpdateCollectionDto): Promise<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: User, id: string): Promise<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findBySlug(slug: string): Promise<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
