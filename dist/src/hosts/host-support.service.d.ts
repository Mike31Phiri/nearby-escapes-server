import { CreateHostSupportTicketDto, TicketTopic, TicketStatus } from './dto/create-host-support-ticket.dto';
export interface HostTicketMessage {
    id: string;
    senderRole: 'host' | 'support' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
}
export interface HostTicketTimelineItem {
    event: string;
    timestamp: string;
    description: string;
}
export interface HostSupportTicket {
    ticketId: string;
    referenceNumber: string;
    status: TicketStatus;
    topic: TicketTopic;
    subject: string;
    message: string;
    previewMessage?: string;
    bookingRef?: string | null;
    listingId?: string | null;
    hostId: string;
    priority?: string;
    assignedTo?: string;
    estimatedResponseTime: string;
    hasUnreadAdminReply?: boolean;
    resolutionSummary?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
    messages: HostTicketMessage[];
    timeline: HostTicketTimelineItem[];
}
export declare class HostSupportService {
    private tickets;
    createTicket(hostId: string, dto: CreateHostSupportTicketDto): Promise<{
        success: boolean;
        data: HostSupportTicket;
    }>;
    getHostTickets(hostId: string, query: {
        status?: string;
        topic?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
            status: TicketStatus;
            topic: TicketTopic;
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
    getTicketById(hostId: string, ticketId: string): Promise<{
        success: boolean;
        data: HostSupportTicket;
    }>;
}
