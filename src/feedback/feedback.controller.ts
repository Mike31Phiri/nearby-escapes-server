import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Feedback')
@Controller()
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('feedback')
  @ApiOperation({ summary: 'Submit a review for a stay' })
  create(@CurrentUser() user: User, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(user.id, dto);
  }

  @Get('stays/:id/feedback')
  @ApiOperation({ summary: 'Get all feedback for a stay' })
  findByStay(@Param('id') id: string) {
    return this.feedbackService.findByStay(id);
  }
}
