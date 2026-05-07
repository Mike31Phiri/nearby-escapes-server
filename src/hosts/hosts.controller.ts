import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
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
  @Roles('TRAVELER')
  @Post()
  becomeHost(@CurrentUser() user: User, @Body() dto: CreateHostDto) {
    return this.hostsService.createHost(user.id, dto);
  }

  @ApiOperation({ summary: 'Get current user host profile' })
  @Get('me')
  myHostProfile(@CurrentUser() user: User) {
    return this.hostsService.findByUserId(user.id);
  }

  @ApiOperation({ summary: 'Get host by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hostsService.findById(id);
  }
}
