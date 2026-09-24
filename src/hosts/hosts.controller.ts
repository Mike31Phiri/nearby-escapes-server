import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostSettingsDto } from './dto/update-host-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Hosts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('hosts')
export class HostsController {
  constructor(private hostsService: HostsService) {}

  @ApiOperation({ summary: 'Upgrade current guest to host' })
  @UseGuards(RolesGuard)
  @Roles('GUEST')
  @Post()
  becomeHost(@CurrentUser() user: User, @Body() dto: CreateHostDto) {
    return this.hostsService.createHost(user.id, dto);
  }

  @ApiOperation({ summary: 'Get current user host profile' })
  @Get('me')
  myHostProfile(@CurrentUser() user: User) {
    return this.hostsService.findByUserId(user.id);
  }

  @ApiOperation({ summary: 'Get host approval status — never throws, always returns status' })
  @Get('me/status')
  hostStatus(@CurrentUser() user: User) {
    return this.hostsService.getHostStatus(user.id);
  }

  @ApiOperation({ summary: 'Get host settings including checkin/checkout times' })
  @Get('me/settings')
  getHostSettings(@CurrentUser() user: User) {
    return this.hostsService.getHostSettings(user.id);
  }

  @ApiOperation({ summary: 'Update host settings including checkin/checkout times and payout account' })
  @Patch('me/settings')
  updateHostSettings(@CurrentUser() user: User, @Body() dto: UpdateHostSettingsDto) {
    return this.hostsService.updateHostSettings(user.id, dto);
  }

  @ApiOperation({ summary: 'Get host by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hostsService.findById(id);
  }
}

