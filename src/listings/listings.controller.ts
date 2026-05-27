import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import {
  CreateStayDto, CreateExperienceDto, CreateTransportDto, UpdateListingDto,
  ListingsQueryDto, CuratedQueryDto, AddImagesDto, RemoveImageDto,
} from './dto/create-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private listingsService: ListingsService,
    private hostsService: HostsService,
  ) {}

  // ─── Search / Public ───────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Search/filter listings' })
  findAll(@Query() query: ListingsQueryDto) {
    return this.listingsService.findAll(query);
  }

  @Get('stays/:id')
  @ApiOperation({ summary: 'Single stay detail' })
  findStay(@Param('id') id: string) {
    return this.listingsService.findStay(id);
  }

  @Get('experiences/:id')
  @ApiOperation({ summary: 'Single experience detail' })
  findExperience(@Param('id') id: string) {
    return this.listingsService.findExperience(id);
  }

  @Get('transport/:id')
  @ApiOperation({ summary: 'Single transport detail' })
  findTransport(@Param('id') id: string) {
    return this.listingsService.findTransport(id);
  }

  @Get('curated')
  @ApiOperation({ summary: 'Curated collections (packages / gems)' })
  getCurated(@Query() query: CuratedQueryDto) {
    return this.listingsService.getCurated(query.type);
  }

  @Get('host/:hostId')
  @ApiOperation({ summary: 'All listings for a host' })
  findByHost(@Param('hostId') hostId: string) {
    return this.listingsService.findByHost(hostId);
  }

  // ─── Create ────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('stays')
  @ApiOperation({ summary: 'Create stay listing' })
  @ApiBearerAuth('access-token')
  async createStay(@CurrentUser() user: User, @Body() dto: CreateStayDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.createStay(host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('experiences')
  @ApiOperation({ summary: 'Create experience' })
  @ApiBearerAuth('access-token')
  async createExperience(@CurrentUser() user: User, @Body() dto: CreateExperienceDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.createExperience(host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('transport')
  @ApiOperation({ summary: 'Create transport' })
  @ApiBearerAuth('access-token')
  async createTransport(@CurrentUser() user: User, @Body() dto: CreateTransportDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.createTransport(host.id, dto);
  }

  // ─── Update / Delete ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put('stays/:id')
  @ApiOperation({ summary: 'Update stay' })
  @ApiBearerAuth('access-token')
  async updateStay(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateListingDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.update(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put('experiences/:id')
  @ApiOperation({ summary: 'Update experience' })
  @ApiBearerAuth('access-token')
  async updateExperience(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateListingDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.update(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put('transport/:id')
  @ApiOperation({ summary: 'Update transport' })
  @ApiBearerAuth('access-token')
  async updateTransport(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateListingDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.update(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete listing' })
  @ApiBearerAuth('access-token')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.remove(id, host.id);
  }

  // ─── Images ────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/images')
  @ApiOperation({ summary: 'Upload listing images' })
  @ApiBearerAuth('access-token')
  async addImages(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: AddImagesDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.addImages(id, host.id, dto.images);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id/images')
  @ApiOperation({ summary: 'Remove listing image' })
  @ApiBearerAuth('access-token')
  async removeImage(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: RemoveImageDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.listingsService.removeImage(id, host.id, dto.imageUrl);
  }
}
