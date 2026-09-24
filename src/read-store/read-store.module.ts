import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReadStoreService } from './read-store.service';
import { PropertySyncWorker } from './property-sync.worker';
import { PropertySyncInterceptor } from './property-sync.interceptor';
import { PrismaModule } from '../prisma/prisma.module';
import { PROPERTY_SYNC_QUEUE } from './property-sync.constants';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') || 'localhost',
          port: config.get<number>('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: PROPERTY_SYNC_QUEUE }),
  ],
  providers: [
    ReadStoreService,
    PropertySyncWorker,
    PropertySyncInterceptor,
  ],
  exports: [ReadStoreService, PropertySyncInterceptor, BullModule],
})
export class ReadStoreModule {}
