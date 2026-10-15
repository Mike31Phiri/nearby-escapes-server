import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZohoService } from './zoho.service';

@Module({
  imports: [ConfigModule],
  providers: [ZohoService],
  exports: [ZohoService],
})
export class ZohoModule {}
