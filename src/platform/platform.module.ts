import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { HomeController } from './home.controller';
import { ReadStoreModule } from '../read-store/read-store.module';

@Module({
  imports: [ReadStoreModule],
  controllers: [PlatformController, HomeController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
