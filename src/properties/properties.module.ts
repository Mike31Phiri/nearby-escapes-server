import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { ListingsController } from './listings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReadStoreModule } from '../read-store/read-store.module';
import { HostsModule } from '../hosts/hosts.module';
import { PopularityModule } from '../popularity/popularity.module';

@Module({
  imports: [PrismaModule, ReadStoreModule, HostsModule, PopularityModule],
  controllers: [PropertiesController, ListingsController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
