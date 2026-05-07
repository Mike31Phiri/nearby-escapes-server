import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { HostDashboardService } from './host-dashboard.service';
import { AccommodationsService } from '../accommodations/accommodations.service';
import { CreateAccommodationDto } from '../accommodations/dto/create-accommodation.dto';
import { UpdateAccommodationDto } from '../accommodations/dto/update-accommodation.dto';
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
    private accommodationsService: AccommodationsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get host dashboard stats, recent bookings, and listings' })
  async dashboard(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getDashboard(host.id);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get host earnings total and monthly breakdown' })
  async earnings(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getEarnings(host.id);
  }

  @Get('calendar/:id')
  @ApiOperation({ summary: 'Get booking calendar for a listing' })
  async calendar(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getCalendar(host.id, id);
  }

  @Get('listings')
  @ApiOperation({ summary: "Get host's own listings" })
  async getListings(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.dashboardService.getListings(host.id);
  }

  @Post('listings')
  @ApiOperation({ summary: 'Create a new listing' })
  async createListing(@CurrentUser() user: User, @Body() dto: CreateAccommodationDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.accommodationsService.create(host.id, dto);
  }

  @Patch('listings/:id')
  @ApiOperation({ summary: 'Update a listing' })
  async updateListing(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAccommodationDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.accommodationsService.update(id, host.id, dto);
  }

  @Delete('listings/:id')
  @ApiOperation({ summary: 'Delete a listing' })
  async deleteListing(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.accommodationsService.remove(id, host.id);
  }
}
