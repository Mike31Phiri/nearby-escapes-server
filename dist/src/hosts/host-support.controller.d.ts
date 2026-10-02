import { CreateHostSupportTicketDto } from './dto/create-host-support-ticket.dto';
import { HostSupportService } from './host-support.service';
export declare class HostSupportController {
    private readonly supportService;
    constructor(supportService: HostSupportService);
    createTicket(req: any, dto: CreateHostSupportTicketDto): Promise<{
        success: boolean;
        data: import("./host-support.service").HostSupportTicket;
    }>;
    getTickets(req: any, status?: string, topic?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        meta: {
            total: number;
            open: number;
            inProgress: number;
            resolved: number;
            page: number;
            limit: number;
        };
        data: {
            ticketId: string;
            referenceNumber: string;
            status: import("./dto/create-host-support-ticket.dto").TicketStatus;
            topic: import("./dto/create-host-support-ticket.dto").TicketTopic;
            subject: string;
            previewMessage: string;
            bookingRef: string | null | undefined;
            listingId: string | null | undefined;
            estimatedResponseTime: string;
            assignedTo: string | undefined;
            hasUnreadAdminReply: boolean;
            resolutionSummary: string | undefined;
            resolvedAt: string | undefined;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    getTicketDetails(req: any, ticketId: string): Promise<{
        success: boolean;
        data: import("./host-support.service").HostSupportTicket;
    }>;
}
