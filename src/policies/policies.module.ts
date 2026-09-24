import { Module } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesAdminController } from './policies-admin.controller';
import { PoliciesController } from './policies.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PoliciesAdminController, PoliciesController],
  providers: [PoliciesService],
  exports: [PoliciesService],
})
export class PoliciesModule {}
