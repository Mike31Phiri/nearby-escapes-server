import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
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

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform dashboard stats' })
  dashboard() {
    return this.adminService.getDashboardStats();
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'All users (paginated, filterable)' })
  getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Suspend/verify user' })
  updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateUserStatus(id, status);
  }

  // ─── Listings ──────────────────────────────────────────────────────────────

  @Get('listings')
  @ApiOperation({ summary: 'All listings (incl. moderation queue)' })
  getListings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getListings(page, limit, status);
  }

  @Patch('listings/:id/status')
  @ApiOperation({ summary: 'Approve/reject listing' })
  updateListingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.updateListingStatus(id, status, reason);
  }

  // ─── Bookings ──────────────────────────────────────────────────────────────

  @Get('bookings')
  @ApiOperation({ summary: 'All bookings' })
  getBookings(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getBookings(page, limit);
  }

  // ─── Disputes ──────────────────────────────────────────────────────────────

  @Get('disputes')
  @ApiOperation({ summary: 'All disputes' })
  getDisputes(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getDisputes(page, limit);
  }

  @Patch('disputes/:id')
  @ApiOperation({ summary: 'Update dispute (status, resolution)' })
  updateDispute(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('resolution') resolution?: string,
  ) {
    return this.adminService.updateDispute(id, status, resolution);
  }

  // ─── Payouts ───────────────────────────────────────────────────────────────

  @Get('payouts')
  @ApiOperation({ summary: 'Monthly payout records' })
  getPayouts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPayouts(page, limit, status);
  }

  @Post('payouts/process')
  @ApiOperation({ summary: 'Process pending payouts' })
  processPayouts(@Body('payoutIds') payoutIds: string[]) {
    return this.adminService.processPayouts(payoutIds);
  }

  // ─── Promotions ────────────────────────────────────────────────────────────

  @Get('promotions')
  @ApiOperation({ summary: 'Promo codes & featured listings' })
  getPromotions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getPromotions(page, limit);
  }

  @Post('promotions')
  @ApiOperation({ summary: 'Create promo code' })
  createPromotion(@Body() data: any) {
    return this.adminService.createPromotion(data);
  }

  @Patch('promotions/:id')
  @ApiOperation({ summary: 'Update promotion' })
  updatePromotion(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePromotion(id, data);
  }

  // ─── Activity Log ──────────────────────────────────────────────────────────

  @Get('activity')
  @ApiOperation({ summary: 'Activity log (audit trail)' })
  getActivity(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getActivityLog(page, limit);
  }

  // ─── Reports ───────────────────────────────────────────────────────────────

  @Get('reports')
  @ApiOperation({ summary: 'Analytics/reports' })
  getReports() {
    return this.adminService.getReports();
  }

  // ─── Settings ──────────────────────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'System settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update settings' })
  updateSettings(@Body('settings') settings: { key: string; value: string }[]) {
    return this.adminService.updateSettings(settings);
  }

  // ─── Hosts ─────────────────────────────────────────────────────────────────

  @Patch('hosts/:id/approve')
  @ApiOperation({ summary: 'Approve host account' })
  approveHost(@Param('id') id: string) {
    return this.adminService.approveHost(id);
  }

  // ─── User management ───────────────────────────────────────────────────────

  @Patch('users/:id/promote')
  @ApiOperation({ summary: 'Promote user to admin' })
  promoteToAdmin(@Param('id') id: string) {
    return this.adminService.promoteToAdmin(id);
  }
}
