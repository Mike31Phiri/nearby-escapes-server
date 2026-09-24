import { PrismaService } from '../prisma/prisma.service';
import { CreateHostDto } from './dto/create-host.dto';
export declare class HostsService {
    private prisma;
    constructor(prisma: PrismaService);
    createHost(userId: string, dto: CreateHostDto): Promise<{
        id: string;
        userId: string;
        displayName: string;
        businessName: string | null;
        verified: boolean;
    }>;
    findById(id: string): Promise<{
        email: string;
        name: string;
        id: string;
        avatar: string | null;
        businessName: string | null;
        isApproved: boolean;
        createdAt: Date;
    }>;
    findByUserId(userId: string): Promise<{
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        avatar: string | null;
        businessName: string | null;
        isApproved: boolean;
    }>;
    getHostStatus(userId: string): Promise<{
        hasProfile: boolean;
        isApproved: boolean;
        hostId: null;
        businessName: null;
        role: "guest";
    } | {
        hasProfile: boolean;
        isApproved: boolean;
        hostId: string;
        businessName: string | null;
        role: "host" | "host_pending";
    }>;
    findApprovedByUserId(userId: string): Promise<{
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        avatar: string | null;
        businessName: string | null;
        isApproved: boolean;
    }>;
    getHostSettings(userId: string): Promise<{
        businessName: string | null;
        defaultCheckInTime: string;
        defaultCheckOutTime: string;
        payoutMethod: string;
        payoutAccount: string | null;
        isApproved: boolean;
    }>;
    updateHostSettings(userId: string, dto: {
        defaultCheckInTime?: string;
        defaultCheckOutTime?: string;
        businessName?: string;
        payoutMethod?: string;
        payoutAccount?: string;
    }): Promise<{
        message: string;
        settings: {
            businessName: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            payoutMethod: string;
            payoutAccount: string | null;
            isApproved: boolean;
        };
    }>;
}
