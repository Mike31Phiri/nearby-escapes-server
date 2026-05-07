import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InboxService } from './inbox.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Inbox')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('inbox')
export class InboxController {
  constructor(private inboxService: InboxService) {}

  @Get('threads')
  @ApiOperation({ summary: 'Get all threads for current user' })
  getThreads(@CurrentUser() user: User) {
    return this.inboxService.getThreads(user.id);
  }

  @Get('threads/:id/messages')
  @ApiOperation({ summary: 'Get messages in a thread' })
  getMessages(@CurrentUser() user: User, @Param('id') id: string) {
    return this.inboxService.getMessages(id, user.id);
  }

  @Post('threads/:id/messages')
  @ApiOperation({ summary: 'Send a message in a thread' })
  sendMessage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('body') body: string,
  ) {
    return this.inboxService.sendMessage(id, user.id, body);
  }

  @Post('threads')
  @ApiOperation({ summary: 'Start a new thread with a recipient' })
  createThread(@CurrentUser() user: User, @Body('recipientId') recipientId: string) {
    return this.inboxService.createThread(user.id, recipientId);
  }
}
