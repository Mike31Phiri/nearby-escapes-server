import { ApiProperty } from '@nestjs/swagger';

export class HostOverviewStatsDto {
  @ApiProperty({ description: 'Total revenue in Ngwee (e.g. 4850000 = ZMW 48,500.00)', example: 4850000 })
  totalRevenueNgwee: number;

  @ApiProperty({ description: 'Count of active listings', example: 4 })
  activeListingsCount: number;

  @ApiProperty({ description: "Count of today's check-ins", example: 2 })
  todayCheckInsCount: number;

  @ApiProperty({ description: "Count of today's check-outs", example: 1 })
  todayCheckOutsCount: number;

  @ApiProperty({ description: 'Count of guests currently being hosted today', example: 3 })
  currentlyHostingCount: number;

  @ApiProperty({ description: 'Occupancy rate percentage (0 - 100)', example: 78 })
  occupancyRatePercent: number;

  @ApiProperty({ description: 'Average rating from guest reviews', example: 4.92 })
  averageRating: number;
}

export class HostOverviewDto {
  @ApiProperty({ type: HostOverviewStatsDto })
  stats: HostOverviewStatsDto;

  @ApiProperty({ description: 'Count of unread notifications', example: 3 })
  unreadNotificationsCount: number;
}
