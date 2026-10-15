import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingReadService } from './booking-read.service';
import { ReadStoreModule } from '../read-store/read-store.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ReadStoreModule, NotificationsModule],
  providers: [BookingsService, BookingReadService],
  controllers: [BookingsController],
  exports: [BookingsService, BookingReadService],
})
export class BookingsModule {}
