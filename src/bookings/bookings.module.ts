import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ReadStoreModule } from '../read-store/read-store.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ReadStoreModule, NotificationsModule],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
