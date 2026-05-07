import { Module } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { HostsController } from './hosts.controller';
import { HostController } from './host.controller';
import { HostDashboardService } from './host-dashboard.service';
import { AccommodationsService } from '../accommodations/accommodations.service';
import { S3Service } from '../uploads/s3.service';

@Module({
  providers: [HostsService, HostDashboardService, AccommodationsService, S3Service],
  controllers: [HostsController, HostController],
  exports: [HostsService],
})
export class HostsModule {}
