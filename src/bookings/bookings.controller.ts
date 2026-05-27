import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
    @Query('role') role?: string,
  ) {
    return this.bookingsService.findMyBookings(user.id, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Single booking detail' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.findOne(id, user.id, user.role);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking (guest or host)' })
  cancel(@CurrentUser() user: User, @Param('id') id: string, @Body() dto?: CancelBookingDto) {
    return this.bookingsService.cancel(id, user.id, dto?.reason);
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
