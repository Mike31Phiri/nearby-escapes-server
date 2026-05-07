import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get personalized stay recommendations based on booking history and location' })
  @ApiQuery({ name: 'location', required: false, description: 'Override location for recommendations' })
  getRecommendations(
    @CurrentUser() user: any,
    @Query('location') location?: string,
  ) {
    return this.recommendationsService.getRecommendations(user.id, location);
  }
}
