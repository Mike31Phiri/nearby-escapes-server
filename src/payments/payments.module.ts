import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { DpoService } from './dpo.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [DpoService],
  controllers: [PaymentsController],
  exports: [DpoService],
})
export class PaymentsModule {}