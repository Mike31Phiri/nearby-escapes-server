import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HostsService } from './hosts.service';
import { OnboardHostDto } from './dto/onboard-host.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Host Onboarding')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('host')
export class HostOnboardingController {
  constructor(private hostsService: HostsService) {}

  @Post('onboard')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit host onboarding & KYC verification application' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  async onboard(@CurrentUser() user: User, @Body() dto: OnboardHostDto) {
    return this.hostsService.submitApplication(user.id, dto);
  }

  @Get('application-status')
  @ApiOperation({ summary: 'Check host onboarding application status' })
  @ApiResponse({ status: 200, description: 'Application status returned' })
  async applicationStatus(@CurrentUser() user: User) {
    return this.hostsService.getApplicationStatus(user.id);
  }
}
