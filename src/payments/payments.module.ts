import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { EskrowService } from './eskrow.service';
import { DpoService } from './dpo.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [EskrowService, DpoService],
  controllers: [PaymentsController],
  exports: [EskrowService, DpoService],
})
export class PaymentsModule {}