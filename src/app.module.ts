import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HostsModule } from './hosts/hosts.module';
import { PropertiesModule } from './properties/properties.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AvailabilityModule } from './availability/availability.module';
// import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { PlatformModule } from './platform/platform.module';
import { ReadStoreModule } from './read-store/read-store.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PoliciesModule } from './policies/policies.module';
import { PopularityModule } from './popularity/popularity.module';
/*The consolidation of all the modules */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 600 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    HostsModule,
    PropertiesModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    WishlistModule,
    AvailabilityModule,
    // UploadsModule, //
    AdminModule,
    PlatformModule,
    ReadStoreModule,
    PoliciesModule,
    PopularityModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }
