import { HostsService } from './hosts.service';
import { OnboardHostDto } from './dto/onboard-host.dto';
import type { User } from '@prisma/client';
export declare class HostOnboardingController {
    private hostsService;
    constructor(hostsService: HostsService);
    onboard(user: User, dto: OnboardHostDto): Promise<{
        applicationId: string;
        userId: string;
        businessName: string;
        status: string;
        submittedAt: Date;
        message: string;
    }>;
    applicationStatus(user: User): Promise<{
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
}
