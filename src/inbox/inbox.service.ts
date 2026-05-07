import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InboxService {
  constructor(private prisma: PrismaService) {}

  async getThreads(userId: string) {
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
      unreadCount: 0, // extend with read receipts if needed
    }));
  }

  async getMessages(threadId: string, userId: string) {
    await this.assertParticipant(threadId, userId);
    return this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(threadId: string, userId: string, body: string) {
    await this.assertParticipant(threadId, userId);
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({ data: { threadId, senderId: userId, body } }),
      this.prisma.thread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
    ]);
    return message;
  }

  async createThread(userId: string, recipientId: string) {
    // Reuse existing thread between same two users if it exists
    const existing = await this.prisma.thread.findFirst({
      where: {
        participants: { every: { userId: { in: [userId, recipientId] } } },
      },
      include: { participants: true },
    });
    if (existing && existing.participants.length === 2) return existing;

    return this.prisma.thread.create({
      data: {
        participants: {
          create: [{ userId }, { userId: recipientId }],
        },
      },
      include: { participants: true },
    });
  }

  private async assertParticipant(threadId: string, userId: string) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
      include: { participants: { where: { userId } } },
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (!thread.participants.length) throw new ForbiddenException();
  }
}
