import { Controller, Get, Patch, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

/** Map backend NotificationType enum → frontend-friendly lowercase string */
const NOTIFICATION_ACTION_LABELS: Record<string, string> = {
  booking_confirmed: 'View Booking',
  booking_request: 'View Booking',
  booking_cancelled: 'View Booking',
  checked_in: 'View Booking',
  checked_out: 'View Booking',
  review_received: 'View Review',
  system: 'View',
  property_approved: 'View Listing',
  property_rejected: 'View Listing',
  payout: 'View Finances',
  message: 'Reply',
};

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /api/notifications
   * Powers the host/guest bell icon popover.
   * Query: limit (default 10), unreadOnly (boolean)
   */
  @Get()
  @ApiOperation({ summary: 'Notification list for current user (limit, unreadOnly filters)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async findAll(
    @CurrentUser() user: User,
    @Query('limit') limitQuery?: string,
    @Query('unreadOnly') unreadOnlyQuery?: string,
  ) {
    const limit = Math.min(100, Math.max(1, Number(limitQuery) || 10));
    const unreadOnly = unreadOnlyQuery === 'true';

    const where: any = { userId: user.id };
    if (unreadOnly) where.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    return {
      unreadCount,
      notifications: notifications.map((n) => {
        const typeKey = n.type.toLowerCase();
        return {
          id: n.id,
          type: typeKey,
          title: n.title,
          description: n.description,
          timestamp: n.createdAt.toISOString(),  // spec uses "timestamp"
          read: n.isRead,                         // spec uses "read" not "isRead"
          actionUrl: n.actionUrl || null,
          actionLabel: NOTIFICATION_ACTION_LABELS[typeKey] || 'View',
        };
      }),
    };
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification read. Returns { id, read: true }.
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  async markRead(@CurrentUser() user: User, @Param('id') id: string) {
    await this.prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
    return { id, read: true };
  }

  /**
   * POST /api/notifications/read-all
   * Clear all unread. Returns { success, unreadCount: 0 }.
   * Note: also kept PATCH alias for backwards compatibility.
   */
  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read (POST)' })
  async markAllReadPost(@CurrentUser() user: User) {
    await this.prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true, unreadCount: 0 };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read (PATCH alias)' })
  async markAllReadPatch(@CurrentUser() user: User) {
    await this.prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true, unreadCount: 0 };
  }
}
