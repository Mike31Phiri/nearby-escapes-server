import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { HostDashboardService } from './host-dashboard.service';
import { BookingsService } from '../bookings/bookings.service';
import { UpdateHostSettingsDto } from './dto/update-host-settings.dto';
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
  @ApiOperation({ summary: "Host's own listings with stats" })
  async getListings(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getListings(host.id);
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

