import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostSettingsDto } from './dto/update-host-settings.dto';
import type { User } from '@prisma/client';
export declare class HostsController {
    private hostsService;
    constructor(hostsService: HostsService);
    becomeHost(user: User, dto: CreateHostDto): Promise<{
        id: string;
        userId: string;
        displayName: string;
        businessName: string | null;
        verified: boolean;
    }>;
    myHostProfile(user: User): Promise<{
        id: string;
        email: string;
        name: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        businessName: string | null;
        isApproved: boolean;
    }>;
    hostStatus(user: User): Promise<{
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
    getHostSettings(user: User): Promise<{
        businessName: string | null;
        defaultCheckInTime: string;
        defaultCheckOutTime: string;
        payoutMethod: string;
        payoutAccount: string | null;
        isApproved: boolean;
    }>;
    updateHostSettings(user: User, dto: UpdateHostSettingsDto): Promise<{
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
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatar: string | null;
        businessName: string | null;
        isApproved: boolean;
        createdAt: Date;
    }>;
}
