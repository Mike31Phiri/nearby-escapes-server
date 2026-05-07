import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'Get dashboard stats' })
  @Get('dashboard')
  dashboard() {
    return this.adminService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Get booking analytics' })
  @Get('analytics/bookings')
  bookingAnalytics() {
    return this.adminService.getBookingAnalytics();
  }

  @ApiOperation({ summary: 'Get payment analytics' })
  @Get('analytics/payments')
  paymentAnalytics() {
    return this.adminService.getPaymentAnalytics();
  }

  @ApiOperation({ summary: 'Get all commission records' })
  @Get('commissions')
  commissions() {
    return this.adminService.getCommissions();
  }

  @ApiOperation({ summary: 'Get all payouts (filter by pending)' })
  @Get('payouts')
  payouts(@Query('pending') pending: string) {
    return this.adminService.getPayouts(pending === 'true');
  }

  @ApiOperation({ summary: 'Mark a payout as paid' })
  @Patch('payouts/:id/paid')
  markPaid(@Param('id') id: string) {
    return this.adminService.markPayoutPaid(id);
  }

  @ApiOperation({ summary: 'Get all users' })
  @Get('users')
  users() {
    return this.adminService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get all bookings' })
  @Get('bookings')
  bookings() {
    return this.adminService.getAllBookings();
  }

  @ApiOperation({ summary: 'Approve a host account' })
  @Patch('hosts/:id/approve')
  approveHost(@Param('id') id: string) {
    return this.adminService.approveHost(id);
  }

  @ApiOperation({ summary: 'Promote a user to admin' })
  @Patch('users/:id/promote-admin')
  promoteToAdmin(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.promoteToAdmin(id, user.id);
  }
}
