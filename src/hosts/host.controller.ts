import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { HostDashboardService } from './host-dashboard.service';
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
}
