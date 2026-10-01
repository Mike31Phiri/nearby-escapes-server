import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { HostsService } from '../hosts/hosts.service';
import { PropertySyncInterceptor } from '../read-store/property-sync.interceptor';
import {
  CreateUnifiedListingDto,
  CreateUnifiedListingResponseDto,
  UpdateListingStatusDto,
  UpdateListingStatusResponseDto,
  DeleteListingResponseDto,
  AdjustInventoryDto,
  AdjustInventoryResponseDto,
} from './dto/create-listing-unified.dto';
import {
  UpdatePropertyPricingDto,
  UpdatePropertyPricingResponseDto,
} from './dto/update-property.dto';
import { PropertiesQueryDto } from './dto/properties-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly readStore: ReadStoreService,
    private readonly hostsService: HostsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Post()
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: '3.1 Create Listing (Unified Gateway)' })
  @ApiResponse({ status: 201, type: CreateUnifiedListingResponseDto })
  @ApiBearerAuth('access-token')
  async createUnified(
    @CurrentUser() user: User,
    @Body() dto: CreateUnifiedListingDto,
  ): Promise<CreateUnifiedListingResponseDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.createUnifiedListing(host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/status')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: '3.2 Update Listing Status (Publish / Pause / Archive / Inactive)' })
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
  @ApiResponse({ status: 200, type: AdjustInventoryResponseDto })
  @ApiBearerAuth('access-token')
  async adjustInventory(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AdjustInventoryDto,
  ): Promise<AdjustInventoryResponseDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.adjustInventoryCount(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Patch(':id/pricing')
  @UseInterceptors(PropertySyncInterceptor)
  @ApiOperation({ summary: 'Update master property pricing table (persists historical bookings)' })
  @ApiResponse({ status: 200, type: UpdatePropertyPricingResponseDto })
  @ApiBearerAuth('access-token')
  async updatePricing(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyPricingDto,
  ): Promise<UpdatePropertyPricingResponseDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.updatePropertyPricing(id, host.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @Delete(':id')
  @UseInterceptors(PropertySyncInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '3.3 Delete / Deactivate Listing' })
  @ApiResponse({ status: 200, type: DeleteListingResponseDto })
  @ApiBearerAuth('access-token')
  async deleteListing(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<DeleteListingResponseDto> {
    const host = await this.hostsService.findApprovedByUserId(user.id);
    return this.propertiesService.deleteListing(id, host.id);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter listings' })
  findAll(@Query() query: PropertiesQueryDto) {
    return this.readStore.searchProperties(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single listing detail' })
  findOne(@Param('id') id: string) {
    return this.readStore.getPropertyById(id);
  }
}
