import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReadStoreModule } from '../read-store/read-store.module';
import { HostsModule } from '../hosts/hosts.module';

@Module({
  imports: [PrismaModule, ReadStoreModule, HostsModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
