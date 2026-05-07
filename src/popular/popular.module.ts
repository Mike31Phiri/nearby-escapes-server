import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PopularService } from './popular.service';
import { PopularController } from './popular.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PopularController],
  providers: [PopularService],
})
export class PopularModule {}
