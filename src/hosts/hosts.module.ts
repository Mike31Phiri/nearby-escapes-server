import { Module } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { HostsController } from './hosts.controller';
import { HostController } from './host.controller';
import { HostDashboardService } from './host-dashboard.service';
import { PropertiesService } from '../properties/properties.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [BookingsModule],
  providers: [HostsService, HostDashboardService, PropertiesService],
  controllers: [HostsController, HostController],
  exports: [HostsService],
})
export class HostsModule {}

