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
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        businessName: string;
        isApproved: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findByUserId(userId: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        businessName: string;
        isApproved: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findApprovedByUserId(userId: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        businessName: string;
        isApproved: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
