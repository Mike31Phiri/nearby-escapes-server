import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(
    private bookingsService: BookingsService,
    private hostsService: HostsService,
  ) {}

  @ApiOperation({ summary: 'Create a new booking (multi-item, group supported)' })
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get booking history for current user with optional filters' })
  @Get()
  myBookings(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.bookingsService.findMyBookings(user.id, status, +page, +limit);
  }

  @ApiOperation({ summary: 'Get a single booking by ID' })
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Get all bookings for current host' })
  @UseGuards(RolesGuard)
  @Roles('HOST')
  @Get('host/all')
  async hostBookings(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.bookingsService.findHostBookings(host.id);
  }

  @ApiOperation({ summary: 'Cancel a booking (traveler)' })
  @Patch(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.cancelBooking(id, user.id);
  }

  @ApiOperation({ summary: 'Approve a booking (host dashboard)' })
  @UseGuards(RolesGuard)
  @Roles('HOST')
  @Post(':id/approve')
  async approve(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.bookingsService.approveByHost(id, host.id);
  }

  @ApiOperation({ summary: 'Reject a booking (host dashboard)' })
  @UseGuards(RolesGuard)
  @Roles('HOST')
  @Post(':id/reject')
  async reject(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.bookingsService.rejectByHost(id, host.id);
  }

  @ApiOperation({ summary: 'Approve booking via email token link' })
  @Post('approve-by-token/:token')
  approveByToken(@Param('token') token: string) {
    return this.bookingsService.approveByToken(token);
  }

  @ApiOperation({ summary: 'Reject booking via email token link' })
  @Post('reject-by-token/:token')
  rejectByToken(@Param('token') token: string) {
    return this.bookingsService.rejectByToken(token);
  }
}
