import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
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
        participants: c.participants.map((p: any) => ({
          id: p.userId,
          name: (p.user as any)?.name || null,
          avatar: (p.user as any)?.avatar || null,
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

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
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

  async sendMessage(conversationId: string, userId: string, text: string) {
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

  async startConversation(userId: string, recipientId: string, initialMessage?: string, listingId?: string, bookingRef?: string) {
    // Check for existing conversation between these two users
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

    // Reload with message
    return this.prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: { participants: { include: { user: { select: { name: true, avatar: true } } } } },
    });
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, read: false },
      data: { read: true },
    });
    return { message: 'Conversation marked as read' };
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: { where: { userId } } },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (!conversation.participants.length) throw new ForbiddenException();
  }
}
