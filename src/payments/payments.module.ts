import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { EskrowService } from './eskrow.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [EskrowService],
  controllers: [PaymentsController],
  exports: [EskrowService],
})
export class PaymentsModule {}