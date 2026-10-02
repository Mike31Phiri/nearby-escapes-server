import { Module } from '@nestjs/common';
import { ReadStoreService } from './read-store.service';
import { PropertySyncInterceptor } from './property-sync.interceptor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReadStoreService, PropertySyncInterceptor],
  exports: [ReadStoreService, PropertySyncInterceptor],
})
export class ReadStoreModule {}
