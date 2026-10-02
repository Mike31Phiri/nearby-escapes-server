import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  /**
   * GET /api/notifications
   * Full paginated list — powers NotificationsPage.tsx
   */
  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiQuery({ name: 'page',       required: false, type: Number  })
  @ApiQuery({ name: 'limit',      required: false, type: Number  })
  @ApiQuery({ name: 'type',       required: false, type: String  })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async getNotifications(
    @CurrentUser() user: User,
    @Query('page')       page?:       string,
    @Query('limit')      limit?:      string,
    @Query('type')       type?:       string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notifService.getUserNotifications(user.id, {
      page:       page       ? +page       : 1,
      limit:      limit      ? +limit      : 20,
      type,
      unreadOnly: unreadOnly === 'true',
    });
  }

  /**
   * GET /api/notifications/unread-count
   * Lightweight badge poll — called by Navbar / HostNav
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count (badge poll)' })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notifService.getUnreadCount(user.id);
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  async markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifService.markAsRead(user.id, id);
  }

  /**
   * POST /api/notifications/read-all
   * Mark ALL as read — "Mark all as read" button
   */
  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllReadPost(@CurrentUser() user: User) {
    return this.notifService.markAllAsRead(user.id);
  }

  /**
   * PATCH /api/notifications/read-all — legacy alias
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read (PATCH alias)' })
  async markAllReadPatch(@CurrentUser() user: User) {
    return this.notifService.markAllAsRead(user.id);
  }

  /**
   * DELETE /api/notifications/:id
   * Soft-delete / dismiss a notification
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Dismiss (soft-delete) a notification' })
  async dismiss(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifService.deleteNotification(user.id, id);
  }
}
