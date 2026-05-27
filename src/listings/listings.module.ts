import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { HostsService } from '../hosts/hosts.service';

@Module({
  providers: [ListingsService, HostsService],
  controllers: [ListingsController],
  exports: [ListingsService],
})
export class ListingsModule {}
