import { Controller, Post, Get, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateHostSupportTicketDto } from './dto/create-host-support-ticket.dto';
import { HostSupportService } from './host-support.service';

@ApiTags('Host Support')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOST')
@Controller('host/support/tickets')
export class HostSupportController {
  constructor(private readonly supportService: HostSupportService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new host support or dispute ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  async createTicket(@Req() req: any, @Body() dto: CreateHostSupportTicketDto) {
    const hostId = req.user?.id || 'host_user_782';
    return this.supportService.createTicket(hostId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List host support tickets with status filter and pagination' })
  @ApiResponse({ status: 200, description: 'List of host support tickets' })
  async getTickets(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('topic') topic?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const hostId = req.user?.id || 'host_user_782';
    return this.supportService.getHostTickets(hostId, {
      status,
      topic,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Get(':ticketId')
  @ApiOperation({ summary: 'Get details, thread, and timeline for a specific support ticket' })
  @ApiResponse({ status: 200, description: 'Ticket thread details' })
  async getTicketDetails(@Req() req: any, @Param('ticketId') ticketId: string) {
    const hostId = req.user?.id || 'host_user_782';
    return this.supportService.getTicketById(hostId, ticketId);
  }
}
