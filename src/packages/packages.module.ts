import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { HostsService } from '../hosts/hosts.service';

@Module({
  imports: [UploadsModule],
  providers: [PackagesService, HostsService],
  controllers: [PackagesController],
  exports: [PackagesService],
})
export class PackagesModule {}
