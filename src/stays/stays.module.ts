import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StaysService } from './stays.service';
import { StaysController } from './stays.controller';

@Module({
  imports: [ConfigModule],
  providers: [StaysService],
  controllers: [StaysController],
  exports: [StaysService],
})
export class StaysModule {}
