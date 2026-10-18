import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SecurityLevelGuard } from '../auth/guards/security-level.guard';
import { SecurityLevel } from '../auth/decorators/security-level.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SecurityLevelGuard)
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

  // ─── Properties / Listings ─────────────────────────────────────────────────

  @Get('properties')
  @ApiOperation({ summary: 'All properties (incl. moderation queue)' })
  getProperties(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getProperties(page, limit, status);
  }

  @Get('listings')
  @ApiOperation({ summary: 'All listings (backwards compatibility)' })
  getListings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getListings(page, limit, status);
  }

  @Patch('properties/:id/status')
  @ApiOperation({ summary: 'Approve/reject property' })
  updatePropertyStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.updatePropertyStatus(id, status, reason);
  }

  @Patch('listings/:id/status')
  @ApiOperation({ summary: 'Approve/reject listing (backwards compatibility)' })
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

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get booking full details (with stays, experiences, transport sub-entities)' })
  getBookingById(@Param('id') id: string) {
    return this.adminService.getBookingById(id);
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Admin override booking status' })
  updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return this.adminService.updateBookingStatus(id, status, notes);
  }

  // ─── Disputes ──────────────────────────────────────────────────────────────

  @Get('disputes')
  @SecurityLevel('CONFIDENTIAL')
  @ApiOperation({ summary: 'All disputes (Confidential — Admin+)' })
  getDisputes(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getDisputes(page, limit, status);
  }

  @Patch('disputes/:id')
  @SecurityLevel('CONFIDENTIAL')
  @ApiOperation({ summary: 'Update dispute status and resolution (Confidential — Admin+)' })
  updateDispute(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('resolution') resolution?: string,
  ) {
    return this.adminService.updateDispute(id, status, resolution);
  }

  // ─── Payment transactions and payouts ──────────────────────────────────────

  @Get('payments')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'All payment transactions (paginated, filterable)' })
  getPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPayments(page, limit, status);
  }

  @Get('payouts')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Monthly payout records' })
  getPayouts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPayouts(page, limit, status);
  }

  @Post('payouts/process')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Process pending payouts' })
  processPayouts(@Body('payoutIds') payoutIds: string[]) {
    return this.adminService.processPayouts(payoutIds);
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

  @Get('host-applications')
  @ApiOperation({ summary: 'List host applications / KYC submissions' })
  getHostApplications(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getHostApplications(status, page, limit);
  }

  @Patch('host-applications/:id/review')
  @ApiOperation({ summary: 'Review host application (approve/reject KYC)' })
  reviewHostApplication(
    @Param('id') id: string,
    @Body() dto: import('./dto/review-host-application.dto').ReviewHostApplicationDto,
  ) {
    return this.adminService.reviewHostApplication(id, dto);
  }

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

  // ─── Diagnostics / Test Email ──────────────────────────────────────────────

  @Post('test-email')
  @ApiOperation({ summary: 'Send diagnostic test email to verify SMTP / Resend delivery' })
  sendTestEmail(
    @CurrentUser() admin: User,
    @Body('to') to?: string,
    @Body('message') message?: string,
  ) {
    return this.adminService.sendTestEmail(to, message, admin?.email);
  }

  @Get('test-email')
  @ApiOperation({ summary: 'Quick test email dispatch using GET' })
  quickTestEmail(
    @CurrentUser() admin: User,
    @Query('to') to?: string,
  ) {
    return this.adminService.sendTestEmail(to, 'Triggered via GET diagnostic', admin?.email);
  }
}
