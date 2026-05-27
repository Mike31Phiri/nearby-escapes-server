import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('listing/:listingId')
  @ApiOperation({ summary: 'Reviews for a listing' })
  findByListing(@Param('listingId') listingId: string) {
    return this.reviewsService.findByListing(listingId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a review (must have completed booking)' })
  create(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reviews by current user' })
  findByUser(@CurrentUser() user: User) {
    return this.reviewsService.findByUser(user.id);
  }
}
