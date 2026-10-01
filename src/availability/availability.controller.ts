import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import {
  BlockDatesDto,
  BlockDatesResponseDto,
  UnblockDatesDto,
  UnblockDatesResponseDto,
  SeasonalPricingDto,
  ExperienceAvailabilityQueryDto,
  TransportAvailabilityQueryDto,
  ExperienceSlotBlockDto,
  ExperienceSlotActionResponseDto,
} from './dto/availability.dto';
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

  @Get('properties/:propertyId')
  @ApiOperation({ summary: 'Property-level calendar availability grid' })
  getPropertyAvailability(
    @Param('propertyId') propertyId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.availabilityService.getPropertyAvailability(
      propertyId,
      year ? +year : undefined,
      month ? +month : undefined,
    );
  }

  // Backwards compatibility endpoint
  @Get(':listingId')
  @ApiOperation({ summary: 'Availability check (supports propertyId or stayId)' })
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

  // ── Host Controls ───────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('unblock-dates')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Unblock dates (Host)' })
  @ApiResponse({ status: 200, type: UnblockDatesResponseDto })
  async unblockDatesEndpoint(
    @CurrentUser() user: User,
    @Body() dto: UnblockDatesDto,
  ): Promise<UnblockDatesResponseDto> {
    const result = await this.availabilityService.unblockDates(dto, user.id);
    return { success: result.success, message: 'Dates unblocked successfully.' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('block-dates')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Block dates (Host) — returns blockedRangeId + echo' })
  @ApiResponse({ status: 200, type: BlockDatesResponseDto })
  async blockDatesEndpoint(
    @CurrentUser() user: User,
    @Body() dto: UnblockDatesDto,
  ): Promise<BlockDatesResponseDto> {
    const listingId = (dto as any).listingId || (dto as any).propertyId || '';
    const startDate = dto.startDate;
    const endDate = dto.endDate;
    const reason = (dto as any).reason;
    await this.availabilityService.blockDates(dto as any, user.id);
    // Generate a deterministic block ID based on listing + dates
    const blockedRangeId = `blk-${Buffer.from(`${listingId}|${startDate}|${endDate}`).toString('base64').replace(/=/g, '').slice(0, 8)}`;
    return {
      success: true,
      blockedRangeId,
      listingId,
      startDate,
      endDate,
      ...(reason ? { reason } : {}),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('experiences/block-slot')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Block an experience time slot for a date' })
  @ApiResponse({ status: 200, type: ExperienceSlotActionResponseDto })
  async blockExperienceSlot(
    @CurrentUser() user: User,
    @Body() dto: ExperienceSlotBlockDto,
  ): Promise<ExperienceSlotActionResponseDto> {
    return this.availabilityService.blockExperienceSlot(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('experiences/unblock-slot')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Unblock an experience time slot for a date' })
  @ApiResponse({ status: 200, type: ExperienceSlotActionResponseDto })
  async unblockExperienceSlot(
    @CurrentUser() user: User,
    @Body() dto: ExperienceSlotBlockDto,
  ): Promise<ExperienceSlotActionResponseDto> {
    return this.availabilityService.unblockExperienceSlot(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('block')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Block date range (Host) - Legacy' })
  blockDates(@CurrentUser() user: User, @Body() dto: BlockDatesDto) {
    return this.availabilityService.blockDates(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('unblock')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Unblock date range (Host) - Legacy' })
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
