import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { PolicyTypeEnum } from './dto/policy.dto';

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published platform policies (Public)' })
  @ApiQuery({ name: 'type', enum: PolicyTypeEnum, required: false })
  getPublished(@Query('type') type?: PolicyTypeEnum) {
    return this.policiesService.getPublishedPolicies(type);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get published policy content by slug (Public)' })
  getBySlug(@Param('slug') slug: string) {
    return this.policiesService.getPolicyBySlug(slug);
  }
}
