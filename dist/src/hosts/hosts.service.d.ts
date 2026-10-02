import { AddHostPayoutMethodDto } from './dto/host-finances.dto';
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
        id: string;
        email: string;
        name: string;
        avatar: string | null;
        businessName: string | null;
        isApproved: boolean;
        createdAt: Date;
    }>;
    findByUserId(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
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
        id: string;
        email: string;
        name: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
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
    submitApplication(userId: string, dto: import('./dto/onboard-host.dto').OnboardHostDto): Promise<{
        applicationId: string;
        userId: string;
        businessName: string;
        status: string;
        submittedAt: Date;
        message: string;
    }>;
    getApplicationStatus(userId: string): Promise<{
        applicationId: null;
        status: string;
        businessName: string | null;
        submittedAt: null;
        reviewerNotes: null;
    } | {
        applicationId: string;
        status: string;
        businessName: string;
        submittedAt: Date;
        reviewerNotes: string | null;
    }>;
    addPayoutMethod(userId: string, dto: AddHostPayoutMethodDto): Promise<{
        success: boolean;
        message: string;
        payoutMethod: {
            id: string;
            type: "bank_transfer" | "mobile_money";
            isDefault: boolean;
            details: import("./dto/host-finances.dto").HostPayoutMethodDetailsDto;
        };
    }>;
    removePayoutMethod(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    setDefaultPayoutMethod(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
