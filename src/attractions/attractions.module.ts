import { Module } from '@nestjs/common';
import { AttractionsService } from './attractions.service';
import { AttractionsController } from './attractions.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { HostsService } from '../hosts/hosts.service';

@Module({
  imports: [UploadsModule],
  providers: [AttractionsService, HostsService],
  controllers: [AttractionsController],
  exports: [AttractionsService],
})
export class AttractionsModule {}
