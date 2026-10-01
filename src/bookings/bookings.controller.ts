import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto/create-booking.dto';
import {
  GuestBookingsGroupedDto,
  GuestBookingItemDto,
  GetGuestBookingsQueryDto,
} from './dto/guest-bookings.dto';
import {
  HostCancelReservationDto,
  HostCancelReservationResponseDto,
} from './dto/host-cancel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get('grouped')
  @ApiOperation({
    summary: 'Get user bookings grouped into upcoming, active, recent, and cancelled',
  })
  @ApiResponse({ status: 200, type: GuestBookingsGroupedDto })
  groupedBookings(
    @CurrentUser() user: User,
    @Query('userId') userId?: string,
  ): Promise<GuestBookingsGroupedDto> {
    return this.bookingsService.getGuestBookingsGrouped(userId || user.id);
  }

  @Get('my-trips')
  @ApiOperation({ summary: 'Alias for grouped user bookings (upcoming, active, recents)' })
  @ApiResponse({ status: 200, type: GuestBookingsGroupedDto })
  myTrips(
    @CurrentUser() user: User,
    @Query('userId') userId?: string,
  ): Promise<GuestBookingsGroupedDto> {
    return this.bookingsService.getGuestBookingsGrouped(userId || user.id);
  }

  @Get()
  @ApiOperation({ summary: "User's bookings with optional category filtering (upcoming, active, recent, all)" })
  @ApiResponse({ status: 200, type: [GuestBookingItemDto] })
  myBookings(
    @CurrentUser() user: User,
    @Query() query: GetGuestBookingsQueryDto & { as?: string },
  ) {
    if (query.as === 'host') {
      return this.bookingsService.findMyBookings(user.id, 'host');
    }
    const targetUserId = query.userId || user.id;
    return this.bookingsService.getGuestBookings(targetUserId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Single booking detail' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.findOne(id, user.id, user.role);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '4.1 Cancel reservation by booking ID and reopen inventory' })
  @ApiResponse({ status: 200, type: HostCancelReservationResponseDto })
  async cancel(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto?: HostCancelReservationDto & CancelBookingDto,
  ) {
    if (dto?.cancelledBy === 'host' || user.role === 'HOST') {
      return this.bookingsService.hostCancel(id, user.id, dto?.reason);
    }
    return this.bookingsService.cancel(id, user.id, dto?.reason);
  }

  @Post(':id/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release a 10-minute hold early if user leaves checkout' })
  releaseHold(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.releaseHold(id, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('HOST', 'ADMIN')
  @Post(':id/check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Host and Admins confirms guest check-in (triggers release of funds to host)' })
  checkIn(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.checkIn(id, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('HOST', 'ADMIN')
  @Post(':id/check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Host confirms guest check-out (reopens inventory immediately)' })
  checkOut(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.checkOut(id, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('HOST')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Confirm/complete booking (host)' })
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('status') status: 'CONFIRMED' | 'COMPLETED',
  ) {
    return this.bookingsService.updateStatus(id, user.id, status);
  }
}
