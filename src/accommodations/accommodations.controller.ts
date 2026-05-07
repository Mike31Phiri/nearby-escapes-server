import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccommodationsService } from './accommodations.service';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';

@ApiTags('Accommodations')
@ApiBearerAuth('access-token')
@Controller('accommodations')
export class AccommodationsController {
  constructor(
    private accommodationsService: AccommodationsService,
    private hostsService: HostsService,
  ) {}

  @Get()
  findAll() {
    return this.accommodationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accommodationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateAccommodationDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.accommodationsService.create(host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id')
  async update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateAccommodationDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.accommodationsService.update(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.accommodationsService.remove(id, host.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Get('host/my')
  async myListings(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.accommodationsService.findByHost(host.id);
  }
}
