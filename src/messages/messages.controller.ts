import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Messages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: "User's conversations" })
  getConversations(@CurrentUser() user: User) {
    return this.messagesService.getConversations(user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Messages in a conversation (paginated)' })
  getMessages(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getMessages(id, user.id, page, limit);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Start a new conversation' })
  startConversation(
    @CurrentUser() user: User,
    @Body('recipientId') recipientId: string,
    @Body('initialMessage') initialMessage?: string,
    @Body('listingId') listingId?: string,
    @Body('bookingRef') bookingRef?: string,
  ) {
    return this.messagesService.startConversation(user.id, recipientId, initialMessage, listingId, bookingRef);
  }

  @Post('conversations/:id')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  sendMessage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('text') text: string,
  ) {
    return this.messagesService.sendMessage(id, user.id, text);
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.messagesService.markAsRead(id, user.id);
  }
}
