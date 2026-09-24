import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put,
  Query, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { PropertySyncInterceptor } from '../read-store/property-sync.interceptor';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateStayDto, UpdateStayDto } from './dto/create-stay.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/create-experience.dto';
import { CreateTransportDto, UpdateTransportDto } from './dto/create-transport.dto';
import { PropertiesQueryDto } from './dto/properties-query.dto';
import { AddImagesDto, RemoveImageDto, AddAmenityDto, AddRuleDto } from './dto/property-extras.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly readStore: ReadStoreService,
    private readonly hostsService: HostsService,
  ) {}

  // ── READ PATH (Redis + Elasticsearch) ──────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Search and filter properties — served from Elasticsearch' })
  findAll(@Query() query: PropertiesQueryDto) {
    return this.readStore.searchProperties(query);
  }

  @Get('host/:hostId')
  @ApiOperation({ summary: 'All properties for a host — served from DB (host context)' })
  findByHost(@Param('hostId') hostId: string) {
    return this.propertiesService.findByHost(hostId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Single property detail (with all units) — served from Redis' })
  findOne(@Param('id') id: string) {
    return this.readStore.getPropertyById(id);
  }

  // ── WRITE PATH: Properties (Business master entity) ─────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post()
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Create a property business brand' })
  @ApiBearerAuth('access-token')
  async create(@CurrentUser() user: User, @Body() dto: CreatePropertyDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.createProperty(host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Update property master entity' })
  @ApiBearerAuth('access-token')
  async update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.update(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Soft-delete property' })
  @ApiBearerAuth('access-token')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.remove(id, host.id);
  }

  // ── STAYS UNITS (Rooms / chalets / flats under a STAY property) ─────────────

  @Get(':id/stays')
  @ApiOperation({ summary: 'List all stay units for a property' })
  listStays(@Param('id') id: string) {
    return this.propertiesService.listStays(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/stays')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Add a room/chalet/unit to a STAY property' })
  @ApiBearerAuth('access-token')
  async addStay(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateStayDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addStay(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/stays/:stayId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Update a room/chalet/unit' })
  @ApiBearerAuth('access-token')
  async updateStay(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('stayId') stayId: string,
    @Body() dto: UpdateStayDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updateStay(id, stayId, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id/stays/:stayId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Remove a room/chalet/unit' })
  @ApiBearerAuth('access-token')
  async removeStay(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('stayId') stayId: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeStay(id, stayId, host.id);
  }

  // ── EXPERIENCE UNITS (Packages / tours under an EXPERIENCE property) ─────────

  @Get(':id/experiences')
  @ApiOperation({ summary: 'List all experience packages for a property' })
  listExperiences(@Param('id') id: string) {
    return this.propertiesService.listExperiences(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/experiences')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Add a tour/package to an EXPERIENCE property' })
  @ApiBearerAuth('access-token')
  async addExperience(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateExperienceDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addExperience(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/experiences/:experienceId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Update an experience package' })
  @ApiBearerAuth('access-token')
  async updateExperience(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updateExperience(id, experienceId, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id/experiences/:experienceId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Remove an experience package' })
  @ApiBearerAuth('access-token')
  async removeExperience(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('experienceId') experienceId: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeExperience(id, experienceId, host.id);
  }

  // ── TRANSPORT UNITS (Routes / vehicles under a TRANSPORT property) ──────────

  @Get(':id/transport')
  @ApiOperation({ summary: 'List all transport routes for a property' })
  listTransports(@Param('id') id: string) {
    return this.propertiesService.listTransports(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/transport')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Add a route to a TRANSPORT property' })
  @ApiBearerAuth('access-token')
  async addTransport(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateTransportDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addTransport(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/transport/:transportId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Update a transport route' })
  @ApiBearerAuth('access-token')
  async updateTransport(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('transportId') transportId: string,
    @Body() dto: UpdateTransportDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updateTransport(id, transportId, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id/transport/:transportId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Remove a transport route' })
  @ApiBearerAuth('access-token')
  async removeTransport(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('transportId') transportId: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeTransport(id, transportId, host.id);
  }

  // ── IMAGES, AMENITIES, RULES ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/images')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Add images to property' })
  @ApiBearerAuth('access-token')
  async addImages(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: AddImagesDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addImages(id, host.id, dto.images);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id/images')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Remove image from property' })
  @ApiBearerAuth('access-token')
  async removeImage(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: RemoveImageDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeImage(id, host.id, dto.imageUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/amenities')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Add dynamic amenity to property' })
  @ApiBearerAuth('access-token')
  async addAmenity(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: AddAmenityDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addAmenity(id, host.id, dto.name, dto.icon);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id/amenities/:amenityId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Remove amenity from property' })
  @ApiBearerAuth('access-token')
  async removeAmenity(@CurrentUser() user: User, @Param('id') id: string, @Param('amenityId') amenityId: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeAmenity(id, host.id, amenityId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/rules')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Add rule to property' })
  @ApiBearerAuth('access-token')
  async addRule(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: AddRuleDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addRule(id, host.id, dto.rule);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id/rules/:ruleId')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Remove rule from property' })
  @ApiBearerAuth('access-token')
  async removeRule(@CurrentUser() user: User, @Param('id') id: string, @Param('ruleId') ruleId: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeRule(id, host.id, ruleId);
  }
}
