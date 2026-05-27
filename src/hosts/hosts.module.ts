import { Module } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { HostsController } from './hosts.controller';
import { HostController } from './host.controller';
import { HostDashboardService } from './host-dashboard.service';
import { ListingsService } from '../listings/listings.service';

@Module({
  providers: [HostsService, HostDashboardService, ListingsService],
  controllers: [HostsController, HostController],
  exports: [HostsService],
})
export class HostsModule {}
