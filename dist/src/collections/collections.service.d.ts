import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(userId: string, dto: CreateCollectionDto): import("@prisma/client").Prisma.Prisma__CollectionClient<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, userId: string, dto: UpdateCollectionDto): Promise<{
        id: string;
        userId: string;
        name: string;
        stayIds: string[];
        isShared: boolean;
        slug: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
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
    private toSlug;
    private assertOwnership;
}
