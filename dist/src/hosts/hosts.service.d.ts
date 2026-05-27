import { PrismaService } from '../prisma/prisma.service';
import { CreateHostDto } from './dto/create-host.dto';
export declare class HostsService {
    private prisma;
    constructor(prisma: PrismaService);
    createHost(userId: string, dto: CreateHostDto): Promise<{
        id: string;
        userId: string;
        displayName: string;
        businessName: string;
        verified: boolean;
    }>;
    findById(id: string): Promise<{
        user: {
            email: string;
            name: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        businessName: string;
        isApproved: boolean;
    }>;
    findByUserId(userId: string): Promise<{
        user: {
            email: string;
            name: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        businessName: string;
        isApproved: boolean;
    }>;
    findApprovedByUserId(userId: string): Promise<{
        user: {
            email: string;
            name: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        businessName: string;
        isApproved: boolean;
    }>;
}
