import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { HostDashboardService } from './host-dashboard.service';
import { BookingsService } from '../bookings/bookings.service';
import { UpdateHostSettingsDto } from './dto/update-host-settings.dto';
import { HostOverviewDto } from './dto/host-overview.dto';
import {
  HostScheduleTodayDto,
  HostCheckInResponseDto,
  HostCheckOutResponseDto,
} from './dto/host-schedule.dto';
import { GetHostBookingsQueryDto, HostBookingListItemDto } from './dto/host-bookings.dto';
import { HostFinancesSummaryDto } from './dto/host-finances.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Host')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOST')
@Controller('host')
export class HostController {
  constructor(
    private hostsService: HostsService,
    private dashboardService: HostDashboardService,
    private bookingsService: BookingsService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Host dashboard overview with operational stats' })
  @ApiResponse({ status: 200, type: HostOverviewDto })
  async overview(@CurrentUser() user: User): Promise<HostOverviewDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getOverview(host.id);
  }

  @Get('schedule/today')
  @ApiOperation({ summary: "Today's operational schedule queue (arriving, hosting, departing)" })
  @ApiResponse({ status: 200, type: HostScheduleTodayDto })
  async scheduleToday(@CurrentUser() user: User): Promise<HostScheduleTodayDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getTodaySchedule(host.id);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get host bookings list with filtering and pagination' })
  @ApiResponse({ status: 200, type: [HostBookingListItemDto] })
  async getBookings(
    @CurrentUser() user: User,
    @Query() query: GetHostBookingsQueryDto,
  ): Promise<{ data: HostBookingListItemDto[]; meta: { page: number; limit: number } }> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    const data = await this.dashboardService.getBookings(host.id, query);
    return {
      data,
      meta: {
        page: Math.max(1, Number(query.page) || 1),
        limit: Math.max(1, Math.min(100, Number(query.limit) || 20)),
      },
    };
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Full booking details modal (host view)' })
  async getBookingDetail(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getBookingDetail(host.id, id);
  }

  @Get('finances/summary')
  @ApiOperation({ summary: 'Get host finances and payout summary' })
  @ApiResponse({ status: 200, type: HostFinancesSummaryDto })
  async getFinancesSummary(@CurrentUser() user: User): Promise<HostFinancesSummaryDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getFinancesSummary(host.id);
  }

  @Patch('schedule/:bookingId/check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check-in guest via operational schedule queue' })
  @ApiResponse({ status: 200, type: HostCheckInResponseDto })
  async checkInSchedule(
    @CurrentUser() user: User,
    @Param('bookingId') bookingId: string,
  ): Promise<HostCheckInResponseDto> {
    const result = await this.bookingsService.checkIn(bookingId, user.id);
    return {
      bookingRef: result.booking.bookingRef,
      status: 'checked_in',
      checkInTimestamp: result.booking.checkedInAt || new Date().toISOString(),
    };
  }

  @Patch('schedule/:bookingId/check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check-out guest via operational schedule queue' })
  @ApiResponse({ status: 200, type: HostCheckOutResponseDto })
  async checkOutSchedule(
    @CurrentUser() user: User,
    @Param('bookingId') bookingId: string,
  ): Promise<HostCheckOutResponseDto> {
    const result = await this.bookingsService.checkOut(bookingId, user.id);
    return {
      bookingRef: result.booking.bookingRef,
      status: 'checked_out',
      checkOutTimestamp: result.booking.checkedOutAt || new Date().toISOString(),
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Host dashboard stats, recent bookings, reviews, earnings' })
  async dashboard(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getDashboard(host.id);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Monthly earnings breakdown' })
  async earnings(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getEarnings(host.id);
  }

  @Get('listings')
  @ApiOperation({ summary: "Host's listings — minimal shape for dropdowns (?fields=id,name,type), full stats otherwise" })
  @ApiQuery({ name: 'fields', required: false, description: 'Comma-separated fields to include (e.g. id,name,type)' })
  async getListings(
    @CurrentUser() user: User,
    @Query('fields') fields?: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    const all = await this.dashboardService.getListings(host.id);
    // When ?fields=id,name,type (or any minimal field set) return slim dropdown shape
    if (fields) {
      const wanted = new Set(fields.split(',').map((f) => f.trim()));
      if (wanted.has('id') && wanted.has('name') && wanted.has('type') && wanted.size <= 3) {
        return all.map((l: any) => ({ id: l.id, name: l.name, type: l.type }));
      }
    }
    return all;
  }

  @Get('settings')
  @ApiOperation({ summary: 'Host settings (usual check-in/out times, payout info)' })
  async getSettings(@CurrentUser() user: User) {
    return this.hostsService.getHostSettings(user.id);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update host settings (usual check-in/out times, payout info)' })
  async updateSettings(@CurrentUser() user: User, @Body() dto: UpdateHostSettingsDto) {
    return this.hostsService.updateHostSettings(user.id, dto);
  }

  @Post('bookings/:id/check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm guest check-in & trigger payout release to host' })
  async checkIn(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.checkIn(id, user.id);
  }

  @Post('bookings/:id/check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm guest check-out & reopen inventory immediately' })
  async checkOut(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.checkOut(id, user.id);
  }
}


