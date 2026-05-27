import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'All notifications for current user' })
  async findAll(@CurrentUser() user: User) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        description: n.description,
        isRead: n.isRead,
        createdAt: n.createdAt,
        actionUrl: n.actionUrl,
      })),
      unreadCount,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  async markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: User) {
    await this.prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }
}
