import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class HostSupportService {
  private tickets: HostSupportTicket[] = [
    {
      ticketId: 'tkt_81e3cc40',
      referenceNumber: 'TKT-8802',
      status: TicketStatus.IN_PROGRESS,
      topic: TicketTopic.GUEST,
      subject: 'Damage deposit claim for Booking BK-2026-8802',
      message: 'Guest left chalet with damaged curtain rail and broken lamp in Chalet 4...',
      previewMessage: 'Guest left chalet with damaged curtain rail and broken lamp in Chalet 4...',
      bookingRef: 'BK-2026-8802',
      listingId: 'prop-chalet-004',
      hostId: 'host_user_782',
      priority: 'high',
      assignedTo: 'Trust & Safety Specialist (Chanda M.)',
      estimatedResponseTime: 'Under Active Review',
      hasUnreadAdminReply: true,
      createdAt: '2026-10-01T14:15:20.000Z',
      updatedAt: '2026-10-02T07:45:10.000Z',
      messages: [
        {
          id: 'msg_001',
          senderRole: 'host',
          senderName: 'Baobab Safari Lodge',
          message: 'Guest left chalet with damaged curtain rail and broken lamp in Chalet 4.',
          timestamp: '2026-10-01T14:15:20.000Z',
        },
      ],
      timeline: [
        {
          event: 'ticket_created',
          timestamp: '2026-10-01T14:15:20.000Z',
          description: 'Dispute submitted by host',
        },
      ],
    },
    {
      ticketId: 'tkt_62c1109a',
      referenceNumber: 'TKT-7612',
      status: TicketStatus.RESOLVED,
      topic: TicketTopic.VERIFICATION,
      subject: 'Zambian Tourism Agency (ZTA) license re-upload',
      message: 'Uploaded newly renewed ZTA license valid until 2027.',
      previewMessage: 'Uploaded newly renewed ZTA license valid until 2027.',
      bookingRef: null,
      listingId: 'prop-chalet-001',
      hostId: 'host_user_782',
      resolutionSummary: 'Listing verified and published to search.',
      resolvedAt: '2026-09-28T11:05:00.000Z',
      estimatedResponseTime: 'Resolved',
      hasUnreadAdminReply: false,
      createdAt: '2026-09-27T16:00:00.000Z',
      updatedAt: '2026-09-28T11:05:00.000Z',
      messages: [
        {
          id: 'msg_002',
          senderRole: 'host',
          senderName: 'Baobab Safari Lodge',
          message: 'Uploaded newly renewed ZTA license valid until 2027.',
          timestamp: '2026-09-27T16:00:00.000Z',
        },
      ],
      timeline: [
        {
          event: 'ticket_resolved',
          timestamp: '2026-09-28T11:05:00.000Z',
          description: 'Listing verified and published to search',
        },
      ],
    },
  ];

  async createTicket(hostId: string, dto: CreateHostSupportTicketDto) {
    const refNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketId = `tkt_${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();

    const newTicket: HostSupportTicket = {
      ticketId,
      referenceNumber: refNum,
      status: TicketStatus.OPEN,
      topic: dto.topic,
      subject: dto.subject,
      message: dto.message,
      previewMessage: dto.message.slice(0, 100),
      bookingRef: dto.bookingRef || null,
      listingId: dto.listingId || null,
      hostId,
      priority: 'medium',
      estimatedResponseTime: 'Within 2 hours',
      hasUnreadAdminReply: false,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderRole: 'host',
          senderName: 'Host Partner',
          message: dto.message,
          timestamp: now,
        },
      ],
      timeline: [
        {
          event: 'ticket_created',
          timestamp: now,
          description: 'Ticket submitted by host',
        },
      ],
    };

    this.tickets.unshift(newTicket);

    return {
      success: true,
      data: newTicket,
    };
  }

  async getHostTickets(
    hostId: string,
    query: { status?: string; topic?: string; page?: number; limit?: number },
  ) {
    let list = this.tickets.filter((t) => t.hostId === hostId || t.hostId === 'host_user_782');

    if (query.status && query.status !== 'all') {
      list = list.filter((t) => t.status === query.status);
    }
    if (query.topic && query.topic !== 'all') {
      list = list.filter((t) => t.topic === query.topic);
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 20);
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    const total = list.length;
    const openCount = list.filter((t) => t.status === TicketStatus.OPEN).length;
    const inProgressCount = list.filter((t) => t.status === TicketStatus.IN_PROGRESS).length;
    const resolvedCount = list.filter((t) => t.status === TicketStatus.RESOLVED).length;

    return {
      success: true,
      meta: {
        total,
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        page,
        limit,
      },
      data: paginated.map((t) => ({
        ticketId: t.ticketId,
        referenceNumber: t.referenceNumber,
        status: t.status,
        topic: t.topic,
        subject: t.subject,
        previewMessage: t.previewMessage || t.message,
        bookingRef: t.bookingRef,
        listingId: t.listingId,
        estimatedResponseTime: t.estimatedResponseTime,
        assignedTo: t.assignedTo,
        hasUnreadAdminReply: !!t.hasUnreadAdminReply,
        resolutionSummary: t.resolutionSummary,
        resolvedAt: t.resolvedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };
  }

  async getTicketById(hostId: string, ticketId: string) {
    const ticket = this.tickets.find((t) => t.ticketId === ticketId);
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }
    return {
      success: true,
      data: ticket,
    };
  }
}
