"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostSupportService = void 0;
const common_1 = require("@nestjs/common");
const create_host_support_ticket_dto_1 = require("./dto/create-host-support-ticket.dto");
let HostSupportService = class HostSupportService {
    tickets = [
        {
            ticketId: 'tkt_81e3cc40',
            referenceNumber: 'TKT-8802',
            status: create_host_support_ticket_dto_1.TicketStatus.IN_PROGRESS,
            topic: create_host_support_ticket_dto_1.TicketTopic.GUEST,
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
            status: create_host_support_ticket_dto_1.TicketStatus.RESOLVED,
            topic: create_host_support_ticket_dto_1.TicketTopic.VERIFICATION,
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
    async createTicket(hostId, dto) {
        const refNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
        const ticketId = `tkt_${Math.random().toString(36).substring(2, 10)}`;
        const now = new Date().toISOString();
        const newTicket = {
            ticketId,
            referenceNumber: refNum,
            status: create_host_support_ticket_dto_1.TicketStatus.OPEN,
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
    async getHostTickets(hostId, query) {
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
        const openCount = list.filter((t) => t.status === create_host_support_ticket_dto_1.TicketStatus.OPEN).length;
        const inProgressCount = list.filter((t) => t.status === create_host_support_ticket_dto_1.TicketStatus.IN_PROGRESS).length;
        const resolvedCount = list.filter((t) => t.status === create_host_support_ticket_dto_1.TicketStatus.RESOLVED).length;
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
    async getTicketById(hostId, ticketId) {
        const ticket = this.tickets.find((t) => t.ticketId === ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException('Support ticket not found');
        }
        return {
            success: true,
            data: ticket,
        };
    }
};
exports.HostSupportService = HostSupportService;
exports.HostSupportService = HostSupportService = __decorate([
    (0, common_1.Injectable)()
], HostSupportService);
//# sourceMappingURL=host-support.service.js.map