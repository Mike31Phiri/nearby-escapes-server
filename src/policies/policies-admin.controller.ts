import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import {
  CreatePolicyDto,
  CreatePolicyVersionDto,
  PolicyTypeEnum,
  UpdatePolicyDto,
} from './dto/policy.dto';

@ApiTags('Admin - Policies')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/policies')
export class PoliciesAdminController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all platform policies (Admin only)' })
  @ApiQuery({ name: 'type', enum: PolicyTypeEnum, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'isPublished', type: Boolean, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  findAll(
    @Query('type') type?: PolicyTypeEnum,
    @Query('search') search?: string,
    @Query('isPublished') isPublished?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.policiesService.getAdminPolicies({
      type,
      search,
      isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full policy details with all versions (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.policiesService.getAdminPolicyById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new platform policy with initial version (Admin only)' })
  create(@Body() dto: CreatePolicyDto, @CurrentUser() user: User) {
    return this.policiesService.createPolicy(dto, user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update policy metadata (title, description, type) (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.policiesService.updatePolicy(id, dto);
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create a new version for an existing policy (Admin only)' })
  createVersion(
    @Param('id') id: string,
    @Body() dto: CreatePolicyVersionDto,
    @CurrentUser() user: User,
  ) {
    return this.policiesService.createVersion(id, dto, user?.id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish or unpublish a policy (Admin only)' })
  setPublishStatus(
    @Param('id') id: string,
    @Body('isPublished') isPublished: boolean,
  ) {
    return this.policiesService.setPublishStatus(id, !!isPublished);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/soft-delete a policy (Admin only)' })
  remove(@Param('id') id: string) {
    return this.policiesService.deletePolicy(id);
  }
}
