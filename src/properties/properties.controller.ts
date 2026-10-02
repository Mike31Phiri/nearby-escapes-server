import { UpdatePropertyPoliciesDto } from '../policies/dto/policy.dto';
import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put,
  Query, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { PropertySyncInterceptor } from '../read-store/property-sync.interceptor';
import { CreatePropertyDto } from './dto/create-property.dto';
import {
  UpdatePropertyDto,
  UpdatePropertyPricingDto,
  UpdatePropertyPricingResponseDto,
} from './dto/update-property.dto';
import { CreateStayDto, UpdateStayDto } from './dto/create-stay.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/create-experience.dto';
import { CreateTransportDto, UpdateTransportDto } from './dto/create-transport.dto';
import { PropertiesQueryDto } from './dto/properties-query.dto';
import { AddImagesDto, RemoveImageDto, AddAmenityDto, AddRuleDto } from './dto/property-extras.dto';
import {
  CreateListingPolicyDto,
  UpdateListingPolicyDto,
  SetListingPoliciesDto,
} from './dto/listing-policy.dto';
import {
  CreateListingTagDto,
  SetListingTagsDto,
  CreateListingRecommendationDto,
  SetListingRecommendationsDto,
  ListingFilterQueryDto,
} from './dto/listing-tag-recommendation.dto';
import { AdjustInventoryDto, UpdateListingStatusDto, UpdateListingStatusResponseDto } from './dto/create-listing-unified.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HostsService } from '../hosts/hosts.service';
import { PopularityService } from '../popularity/popularity.service';
import type { User } from '@prisma/client';
import { PropertyStatus } from '@prisma/client';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly readStore: ReadStoreService,
    private readonly hostsService: HostsService,
    private readonly popularityService: PopularityService,
  ) {}

  // ── READ PATH (Redis + Elasticsearch) ──────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Search and filter properties — served from Elasticsearch' })
  findAll(@Query() query: PropertiesQueryDto) {
    return this.readStore.searchProperties(query);
  }

  @Get('popular/stays')
  @ApiOperation({ summary: 'Top 10 popular stays (Redis cached, midnight 24h cron)' })
  getPopularStays() {
    return this.popularityService.getPopularStays();
  }

  @Get('popular/experiences')
  @ApiOperation({ summary: 'Top 10 popular experiences (Redis cached, midnight 24h cron)' })
  getPopularExperiences() {
    return this.popularityService.getPopularExperiences();
  }

  @Get('tags/available')
  @ApiOperation({ summary: 'Get all distinct tags grouped by category for filter pills and chips' })
  getAvailableTags() {
    return this.propertiesService.getAllAvailableTags();
  }

  @Get('discover')
  @ApiOperation({ summary: 'Filter and discover properties using tags, category, amenities, activity, trip type, or recommendations' })
  filterProperties(@Query() query: ListingFilterQueryDto) {
    return this.propertiesService.filterByTags(query);
  }

  @Get('sample-images')
  @ApiOperation({ summary: 'Get sample/stock image URLs stored in DB for API testing and mock listing creation' })
  getSampleImages(
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    return this.propertiesService.getSampleImages(category, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('units/:unitType/:unitId/tags')
  @ApiOperation({ summary: 'Get tags for a specific Stay, Experience, or Transport unit' })
  getUnitTags(
    @Param('unitType') unitType: 'stay' | 'experience' | 'transport',
    @Param('unitId') unitId: string,
  ) {
    return this.propertiesService.getTags(unitType, unitId);
  }

  @Get('units/:unitType/:unitId/recommendations')
  @ApiOperation({ summary: 'Get recommendations for a specific Stay, Experience, or Transport unit' })
  getUnitRecommendations(
    @Param('unitType') unitType: 'stay' | 'experience' | 'transport',
    @Param('unitId') unitId: string,
  ) {
    return this.propertiesService.getRecommendations(unitType, unitId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Get('drafts')
  @ApiOperation({ summary: 'Get all draft listings for the authenticated host' })
  @ApiBearerAuth('access-token')
  async getMyDrafts(@CurrentUser() user: User) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.findDraftsByHost(host.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Get('drafts/:id')
  @ApiOperation({ summary: 'Get a specific draft listing for the authenticated host (wizard resume)' })
  @ApiBearerAuth('access-token')
  async getMyDraftById(@CurrentUser() user: User, @Param('id') id: string) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.findDraftById(id, host.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Get('my-properties')
  @ApiOperation({ summary: 'All properties owned by the authenticated host (can filter ?status=ACTIVE or DRAFT)' })
  @ApiBearerAuth('access-token')
  async getMyProperties(
    @CurrentUser() user: User,
    @Query('status') status?: PropertyStatus,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.findByHost(host.id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post('draft')
  @ApiOperation({ summary: 'Save new listing as draft (Save & Exit)' })
  @ApiBearerAuth('access-token')
  async saveDraft(@CurrentUser() user: User, @Body() dto: CreatePropertyDto) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.saveDraft(host.id, dto);
  }

  @Get('host/:hostId')
  @ApiOperation({ summary: 'Public listings for a host profile (GUESTS ONLY — strictly ACTIVE listings)' })
  findByHost(@Param('hostId') hostId: string) {
    return this.propertiesService.findByHost(hostId, PropertyStatus.ACTIVE);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Single property detail (with all units) — served from Redis' })
  findOne(@Param('id') id: string) {
    return this.readStore.getPropertyById(id);
  }

  @Get(':id/tags')
  @ApiOperation({ summary: 'All tags for a property' })
  getPropertyTags(@Param('id') id: string) {
    return this.propertiesService.getTags('property', id);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'All curated recommendations for a property' })
  getPropertyRecommendations(@Param('id') id: string) {
    return this.propertiesService.getRecommendations('property', id);
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
  @Patch(':id/draft')
  @ApiOperation({ summary: 'Update an existing draft listing (Save & Exit step)' })
  @ApiBearerAuth('access-token')
  async updateDraft(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updateDraft(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/status')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Update property status (active, draft, paused, archived, inactive)' })
  @ApiResponse({ status: 200, type: UpdateListingStatusResponseDto })
  @ApiBearerAuth('access-token')
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateListingStatusDto,
  ): Promise<UpdateListingStatusResponseDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updateListingStatus(id, host.id, dto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/inventory')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Adjust property inventory count (increase / decrease / set)' })
  @ApiBearerAuth('access-token')
  async adjustInventory(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AdjustInventoryDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.adjustInventoryCount(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/pricing')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Update master property pricing table (persists historical bookings)' })
  @ApiBearerAuth('access-token')
  async updatePricing(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyPricingDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updatePropertyPricing(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id/wizard/step/:step')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Save stage data when host clicks Next in listing wizard' })
  @ApiBearerAuth('access-token')
  async saveWizardStep(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('step') step: string,
    @Body() payload: any,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.saveWizardStep(id, host.id, parseInt(step, 10), payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/publish')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Publish a draft listing (validates completeness and activates)' })
  @ApiBearerAuth('access-token')
  async publish(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.publishListing(id, host.id);
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

  // ── LISTING POLICIES ────────────────────────────────────────────────────────
  // Policies are scoped to unit types: stays, experiences, transport.
  // Policies are returned automatically on GET /properties/:id via fullInclude.

  // ─ STAYS policies ─

  @Get(':id/stays/:stayId/policies')
  @ApiOperation({ summary: 'Get all policies for a stay unit (public)' })
  getStayPolicies(@Param('stayId') stayId: string) {
    return this.propertiesService.getListingPolicies('stay', stayId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/stays/:stayId/policies')
  @ApiOperation({ summary: 'Add a policy to a stay unit' })
  @ApiBearerAuth('access-token')
  async addStayPolicy(
    @CurrentUser() user: User,
    @Param('stayId') stayId: string,
    @Body() dto: CreateListingPolicyDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addListingPolicy('stay', stayId, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id/stays/:stayId/policies')
  @ApiOperation({ summary: 'Bulk-replace all policies for a stay unit (PUT = full replace)' })
  @ApiBearerAuth('access-token')
  async setStayPolicies(
    @CurrentUser() user: User,
    @Param('stayId') stayId: string,
    @Body() dto: SetListingPoliciesDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.setListingPolicies('stay', stayId, host.id, dto);
  }

  // ─ EXPERIENCES policies ─

  @Get(':id/experiences/:experienceId/policies')
  @ApiOperation({ summary: 'Get all policies for an experience unit (public)' })
  getExperiencePolicies(@Param('experienceId') experienceId: string) {
    return this.propertiesService.getListingPolicies('experience', experienceId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/experiences/:experienceId/policies')
  @ApiOperation({ summary: 'Add a policy to an experience unit' })
  @ApiBearerAuth('access-token')
  async addExperiencePolicy(
    @CurrentUser() user: User,
    @Param('experienceId') experienceId: string,
    @Body() dto: CreateListingPolicyDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addListingPolicy('experience', experienceId, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id/experiences/:experienceId/policies')
  @ApiOperation({ summary: 'Bulk-replace all policies for an experience unit (PUT = full replace)' })
  @ApiBearerAuth('access-token')
  async setExperiencePolicies(
    @CurrentUser() user: User,
    @Param('experienceId') experienceId: string,
    @Body() dto: SetListingPoliciesDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.setListingPolicies('experience', experienceId, host.id, dto);
  }

  // ─ TRANSPORT policies ─

  @Get(':id/transport/:transportId/policies')
  @ApiOperation({ summary: 'Get all policies for a transport unit (public)' })
  getTransportPolicies(@Param('transportId') transportId: string) {
    return this.propertiesService.getListingPolicies('transport', transportId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/transport/:transportId/policies')
  @ApiOperation({ summary: 'Add a policy to a transport unit' })
  @ApiBearerAuth('access-token')
  async addTransportPolicy(
    @CurrentUser() user: User,
    @Param('transportId') transportId: string,
    @Body() dto: CreateListingPolicyDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addListingPolicy('transport', transportId, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id/transport/:transportId/policies')
  @ApiOperation({ summary: 'Bulk-replace all policies for a transport unit (PUT = full replace)' })
  @ApiBearerAuth('access-token')
  async setTransportPolicies(
    @CurrentUser() user: User,
    @Param('transportId') transportId: string,
    @Body() dto: SetListingPoliciesDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.setListingPolicies('transport', transportId, host.id, dto);
  }

  // ─ Shared single-policy edit/delete (works for all unit types) ─

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch('policies/:policyId')
  @ApiOperation({ summary: 'Update a single listing policy' })
  @ApiBearerAuth('access-token')
  async updateListingPolicy(
    @CurrentUser() user: User,
    @Param('policyId') policyId: string,
    @Body() dto: UpdateListingPolicyDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updateListingPolicy(policyId, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('policies/:policyId')
  @ApiOperation({ summary: 'Delete a single listing policy' })
  @ApiBearerAuth('access-token')
  async removeListingPolicy(
    @CurrentUser() user: User,
    @Param('policyId') policyId: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeListingPolicy(policyId, host.id);
  }

  // ── TAGS & RECOMMENDATIONS MANAGEMENT ───────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/tags')
  @ApiOperation({ summary: 'Add a tag to a property' })
  @ApiBearerAuth('access-token')
  async addPropertyTag(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateListingTagDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addTag('property', id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id/tags')
  @ApiOperation({ summary: 'Bulk replace all tags on a property' })
  @ApiBearerAuth('access-token')
  async setPropertyTags(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SetListingTagsDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.setTags('property', id, host.id, dto.tags);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('tags/:tagId')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiBearerAuth('access-token')
  async removeTag(
    @CurrentUser() user: User,
    @Param('tagId') tagId: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeTag(tagId, host.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post(':id/recommendations')
  @ApiOperation({ summary: 'Add a recommendation to a property' })
  @ApiBearerAuth('access-token')
  async addPropertyRecommendation(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateListingRecommendationDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.addRecommendation('property', id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id/recommendations')
  @ApiOperation({ summary: 'Bulk replace all recommendations on a property' })
  @ApiBearerAuth('access-token')
  async setPropertyRecommendations(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SetListingRecommendationsDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.setRecommendations('property', id, host.id, dto.recommendations);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete('recommendations/:recId')
  @ApiOperation({ summary: 'Delete a recommendation' })
  @ApiBearerAuth('access-token')
  async removeRecommendation(
    @CurrentUser() user: User,
    @Param('recId') recId: string,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.removeRecommendation(recId, host.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put('units/:unitType/:unitId/tags')
  @ApiOperation({ summary: 'Bulk replace tags on a specific unit (stay, experience, or transport)' })
  @ApiBearerAuth('access-token')
  async setUnitTags(
    @CurrentUser() user: User,
    @Param('unitType') unitType: 'stay' | 'experience' | 'transport',
    @Param('unitId') unitId: string,
    @Body() dto: SetListingTagsDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.setTags(unitType, unitId, host.id, dto.tags);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put('units/:unitType/:unitId/recommendations')
  @ApiOperation({ summary: 'Bulk replace recommendations on a specific unit' })
  @ApiBearerAuth('access-token')
  async setUnitRecommendations(
    @CurrentUser() user: User,
    @Param('unitType') unitType: 'stay' | 'experience' | 'transport',
    @Param('unitId') unitId: string,
    @Body() dto: SetListingRecommendationsDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.setRecommendations(unitType, unitId, host.id, dto.recommendations);
  }

  @Get(':id/policies')
  @ApiOperation({ summary: 'Public: Fetch Property Policies' })
  async getPropertyPolicies(@Param('id') id: string) {
    return this.propertiesService.getPropertyPolicies(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Put(':id/policies')
  @ApiOperation({ summary: 'Host: Update Property Policies' })
  @ApiBearerAuth('access-token')
  async updatePropertyPolicies(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyPoliciesDto,
  ) {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updatePropertyPolicies(id, host.id, dto);
  }

}
