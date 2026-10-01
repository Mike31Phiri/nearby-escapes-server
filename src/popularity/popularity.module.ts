import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PopularityService } from './popularity.service';
import { PopularityController } from './popularity.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PopularityController],
  providers: [PopularityService],
  exports: [PopularityService],
})
export class PopularityModule {}
