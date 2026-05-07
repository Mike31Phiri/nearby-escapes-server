import { Module } from '@nestjs/common';
import { AccommodationsService } from './accommodations.service';
import { AccommodationsController } from './accommodations.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { HostsService } from '../hosts/hosts.service';

@Module({
  imports: [UploadsModule],
  providers: [AccommodationsService, HostsService],
  controllers: [AccommodationsController],
  exports: [AccommodationsService],
})
export class AccommodationsModule {}
