import { Module } from '@nestjs/common';
import { BusesService } from './buses.service';
import { BusesController } from './buses.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { HostsService } from '../hosts/hosts.service';

@Module({
  imports: [UploadsModule],
  providers: [BusesService, HostsService],
  controllers: [BusesController],
  exports: [BusesService],
})
export class BusesModule {}
