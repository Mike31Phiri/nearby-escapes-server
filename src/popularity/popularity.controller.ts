import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PopularityService } from './popularity.service';

@ApiTags('Popularity')
@Controller('popular')
export class PopularityController {
  constructor(private readonly popularityService: PopularityService) {}

  @Get('stays')
  @ApiOperation({
    summary: 'Get top 10 popular stays',
    description: 'Cached in Redis, recalculated every 24 hours at midnight based on confirmed/total bookings.',
  })
  @ApiResponse({ status: 200, description: 'List of up to 10 most popular stays with booking counts and rank.' })
  getPopularStays() {
    return this.popularityService.getPopularStays();
  }

  @Get('experiences')
  @ApiOperation({
    summary: 'Get top 10 popular experiences',
    description: 'Cached in Redis, recalculated every 24 hours at midnight based on confirmed/total bookings.',
  })
  @ApiResponse({ status: 200, description: 'List of up to 10 most popular experiences with booking counts and rank.' })
  getPopularExperiences() {
    return this.popularityService.getPopularExperiences();
  }

  @Get('metadata')
  @ApiOperation({ summary: 'Get popularity cache status and last updated timestamp' })
  getMetadata() {
    return this.popularityService.getMetadata();
  }

  @Post('recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger 24h popularity calculation and update Redis cache',
    description: 'Recalculates popular stays and experiences immediately from the bookings table and updates Redis keys.',
  })
  recalculate() {
    return this.popularityService.recalculateAll();
  }
}
