import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { BlockDatesDto, SeasonalPricingDto, ExperienceAvailabilityQueryDto, TransportAvailabilityQueryDto } from './dto/availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  // ── Stay Availability (Calendar dates & 10-min holds) ────────────────────────

  @Get('stays/:stayId')
  @ApiOperation({ summary: 'Month grid of stay availability and 10-minute active holds' })
  getStayAvailability(
    @Param('stayId') stayId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.availabilityService.getStayAvailability(
      stayId,
      year ? +year : undefined,
      month ? +month : undefined,
    );
  }

  // ── Experience Availability (Time slots & 10-min holds) ──────────────────────

  @Get('experiences/:experienceId')
  @ApiOperation({ summary: 'Experience time slot availability for a specific date (blocks held/booked slots)' })
  getExperienceAvailability(
    @Param('experienceId') experienceId: string,
    @Query() query: ExperienceAvailabilityQueryDto,
  ) {
    return this.availabilityService.getExperienceAvailability(experienceId, query.date);
  }

  // ── Transport Availability (Seats & departure capacity) ──────────────────────

  @Get('transport/:transportId')
  @ApiOperation({ summary: 'Transport seat availability for a specific date' })
  getTransportAvailability(
    @Param('transportId') transportId: string,
    @Query() query: TransportAvailabilityQueryDto,
  ) {
    return this.availabilityService.getTransportAvailability(transportId, query.date);
  }

  // Backwards compatibility endpoint
  @Get(':listingId')
  @ApiOperation({ summary: 'Availability check (backwards compatibility)' })
  getAvailability(
    @Param('listingId') listingId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.availabilityService.getStayAvailability(
      listingId,
      year ? +year : undefined,
      month ? +month : undefined,
    );
  }

  // ── Host Controls ───────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('block')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Block date range (Host)' })
  blockDates(@CurrentUser() user: User, @Body() dto: BlockDatesDto) {
    return this.availabilityService.blockDates(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('unblock')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Unblock date range (Host)' })
  unblockDates(@CurrentUser() user: User, @Body() dto: BlockDatesDto) {
    return this.availabilityService.unblockDates(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('seasonal-pricing')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add seasonal pricing rule (Host)' })
  addSeasonalPricing(@CurrentUser() user: User, @Body() dto: SeasonalPricingDto) {
    return this.availabilityService.addSeasonalPricing(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('seasonal-pricing/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove seasonal pricing rule (Host)' })
  removeSeasonalPricing(@CurrentUser() user: User, @Param('id') id: string) {
    return this.availabilityService.removeSeasonalPricing(id, user.id);
  }
}
