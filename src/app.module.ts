import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HostsModule } from './hosts/hosts.module';
import { AccommodationsModule } from './accommodations/accommodations.module';
import { BusesModule } from './buses/buses.module';
import { AttractionsModule } from './attractions/attractions.module';
import { PackagesModule } from './packages/packages.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { PopularModule } from './popular/popular.module';
import { ApiModule } from './api/api.module';
import { StaysModule } from './stays/stays.module';
import { CollectionsModule } from './collections/collections.module';
import { FeedbackModule } from './feedback/feedback.module';
import { InboxModule } from './inbox/inbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    HostsModule,
    AccommodationsModule,
    BusesModule,
    AttractionsModule,
    PackagesModule,
    BookingsModule,
    PaymentsModule,
    NotificationsModule,
    RecommendationsModule,
    UploadsModule,
    AdminModule,
    PopularModule,
    ApiModule,
    StaysModule,
    CollectionsModule,
    FeedbackModule,
    InboxModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
