import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { HostsService } from '../hosts/hosts.service';

@Module({
  providers: [BookingsService, HostsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
