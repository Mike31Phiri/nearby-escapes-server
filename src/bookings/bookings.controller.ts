import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto/create-booking.dto';
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

  @Get()
  @ApiOperation({ summary: "User's bookings" })
  myBookings(
    @CurrentUser() user: User,
    @Query('as') as?: string,
  ) {
    return this.bookingsService.findMyBookings(user.id, as);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Single booking detail' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.findOne(id, user.id, user.role);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking (guest or host)' })
  cancel(@CurrentUser() user: User, @Param('id') id: string, @Body() dto?: CancelBookingDto) {
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
  @ApiOperation({ summary: 'Host confirms guest check-in (triggers release of funds to host)' })
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
