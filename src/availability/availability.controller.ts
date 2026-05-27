import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { BlockDatesDto, SeasonalPricingDto } from './dto/availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get(':listingId')
  @ApiOperation({ summary: 'Month grid of availability' })
  getAvailability(
    @Param('listingId') listingId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.availabilityService.getAvailability(
      listingId,
      year ? +year : undefined,
      month ? +month : undefined,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('block')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Block date range' })
  blockDates(@CurrentUser() user: User, @Body() dto: BlockDatesDto) {
    return this.availabilityService.blockDates(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('unblock')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Unblock date range' })
  unblockDates(@CurrentUser() user: User, @Body() dto: BlockDatesDto) {
    return this.availabilityService.unblockDates(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('seasonal-pricing')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add seasonal pricing rule' })
  addSeasonalPricing(@CurrentUser() user: User, @Body() dto: SeasonalPricingDto) {
    return this.availabilityService.addSeasonalPricing(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('seasonal-pricing/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove seasonal pricing' })
  removeSeasonalPricing(@CurrentUser() user: User, @Param('id') id: string) {
    return this.availabilityService.removeSeasonalPricing(id, user.id);
  }
}
