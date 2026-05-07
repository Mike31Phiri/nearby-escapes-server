import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PopularService } from './popular.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Popular')
@Controller('popular')
export class PopularController {
  constructor(private popularService: PopularService) {}

  @ApiOperation({ summary: 'Get popular accommodations' })
  @Get('accommodations')
  accommodations() {
    return this.popularService.getPopularAccommodations();
  }

  @ApiOperation({ summary: 'Get popular buses' })
  @Get('buses')
  buses() {
    return this.popularService.getPopularBuses();
  }

  @ApiOperation({ summary: 'Get popular attractions' })
  @Get('attractions')
  attractions() {
    return this.popularService.getPopularAttractions();
  }

  @ApiOperation({ summary: 'Get popular packages' })
  @Get('packages')
  packages() {
    return this.popularService.getPopularPackages();
  }

  @ApiOperation({ summary: 'Sync popular tables from booking data (admin only)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('sync')
  sync() {
    return this.popularService.syncPopular();
  }
}
