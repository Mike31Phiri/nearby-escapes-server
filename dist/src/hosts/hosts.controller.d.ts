import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
import type { User } from '@prisma/client';
export declare class HostsController {
    private hostsService;
    constructor(hostsService: HostsService);
    becomeHost(user: User, dto: CreateHostDto): Promise<{
        id: string;
        userId: string;
        displayName: string;
        businessName: string;
        verified: boolean;
    }>;
    myHostProfile(user: User): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessName: string;
        isApproved: boolean;
        userId: string;
    }>;
    findOne(id: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessName: string;
        isApproved: boolean;
        userId: string;
    }>;
}
