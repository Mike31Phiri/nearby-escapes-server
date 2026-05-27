"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConversations(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: { participants: { some: { userId } } },
            include: {
                participants: { include: { user: { select: { name: true, avatar: true } } } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return Promise.all(conversations.map(async (c) => {
            const unreadCount = await this.prisma.message.count({
                where: {
                    conversationId: c.id,
                    senderId: { not: userId },
                    read: false,
                },
            });
            return {
                id: c.id,
                participants: c.participants.map((p) => ({
                    id: p.userId,
                    name: p.user?.name || null,
                    avatar: p.user?.avatar || null,
                })),
                lastMessage: c.messages[0] ? {
                    id: c.messages[0].id,
                    senderId: c.messages[0].senderId,
                    senderName: c.participants.find((p) => p.userId === c.messages[0].senderId)?.user?.name || 'Unknown',
                    text: c.messages[0].text,
                    createdAt: c.messages[0].createdAt,
                } : null,
                unreadCount,
                listingId: c.listingId || null,
                listingName: null,
                createdAt: c.createdAt,
            };
        }));
    }
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        await this.assertParticipant(conversationId, userId);
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);
        return {
            data: messages.reverse(),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async sendMessage(conversationId, userId, text) {
        await this.assertParticipant(conversationId, userId);
        const [message] = await this.prisma.$transaction([
            this.prisma.message.create({
                data: { conversationId, senderId: userId, text },
            }),
            this.prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            }),
        ]);
        return {
            id: message.id,
            senderId: message.senderId,
            text: message.text,
            createdAt: message.createdAt,
            read: false,
        };
    }
    async startConversation(userId, recipientId, initialMessage, listingId, bookingRef) {
        const existing = await this.prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: recipientId } } },
                ],
            },
            include: { participants: { include: { user: { select: { name: true, avatar: true } } } } },
        });
        if (existing) {
            if (initialMessage) {
                await this.sendMessage(existing.id, userId, initialMessage);
            }
            return existing;
        }
        const conversation = await this.prisma.conversation.create({
            data: {
                participants: {
                    create: [{ userId }, { userId: recipientId }],
                },
                listingId: listingId || null,
                bookingRef: bookingRef || null,
            },
            include: { participants: { include: { user: { select: { name: true, avatar: true } } } } },
        });
        if (initialMessage) {
            await this.sendMessage(conversation.id, userId, initialMessage);
        }
        return this.prisma.conversation.findUnique({
            where: { id: conversation.id },
            include: { participants: { include: { user: { select: { name: true, avatar: true } } } } },
        });
    }
    async markAsRead(conversationId, userId) {
        await this.assertParticipant(conversationId, userId);
        await this.prisma.message.updateMany({
            where: { conversationId, senderId: { not: userId }, read: false },
            data: { read: true },
        });
        return { message: 'Conversation marked as read' };
    }
    async assertParticipant(conversationId, userId) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: { where: { userId } } },
        });
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        if (!conversation.participants.length)
            throw new common_1.ForbiddenException();
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map