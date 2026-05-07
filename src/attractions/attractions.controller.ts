import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttractionsService } from './attractions.service';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';

@ApiTags('Attractions')
@ApiBearerAuth('access-token')
@Controller('attractions')
export class AttractionsController {
  constructor(
    private attractionsService: AttractionsService,
    private hostsService: HostsService,
  ) {}

  @Get()
  findAll() {
    return this.attractionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attractionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateAttractionDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.attractionsService.create(host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id')
  async update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateAttractionDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.attractionsService.update(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.attractionsService.remove(id, host.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Get('host/my')
  async myListings(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.attractionsService.findByHost(host.id);
  }
}
