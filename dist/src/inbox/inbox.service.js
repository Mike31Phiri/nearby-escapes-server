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
exports.InboxService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InboxService = class InboxService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getThreads(userId) {
        const threads = await this.prisma.thread.findMany({
            where: { participants: { some: { userId } } },
            include: {
                participants: { select: { userId: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return threads.map((t) => ({
            id: t.id,
            participants: t.participants.map((p) => p.userId),
            lastMessage: t.messages[0] ?? null,
            unreadCount: 0,
        }));
    }
    async getMessages(threadId, userId) {
        await this.assertParticipant(threadId, userId);
        return this.prisma.message.findMany({
            where: { threadId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async sendMessage(threadId, userId, body) {
        await this.assertParticipant(threadId, userId);
        const [message] = await this.prisma.$transaction([
            this.prisma.message.create({ data: { threadId, senderId: userId, body } }),
            this.prisma.thread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
        ]);
        return message;
    }
    async createThread(userId, recipientId) {
        const existing = await this.prisma.thread.findFirst({
            where: {
                participants: { every: { userId: { in: [userId, recipientId] } } },
            },
            include: { participants: true },
        });
        if (existing && existing.participants.length === 2)
            return existing;
        return this.prisma.thread.create({
            data: {
                participants: {
                    create: [{ userId }, { userId: recipientId }],
                },
            },
            include: { participants: true },
        });
    }
    async assertParticipant(threadId, userId) {
        const thread = await this.prisma.thread.findUnique({
            where: { id: threadId },
            include: { participants: { where: { userId } } },
        });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        if (!thread.participants.length)
            throw new common_1.ForbiddenException();
    }
};
exports.InboxService = InboxService;
exports.InboxService = InboxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InboxService);
//# sourceMappingURL=inbox.service.js.map