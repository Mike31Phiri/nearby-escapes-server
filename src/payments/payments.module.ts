import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { DpoService } from './dpo.service';

@Module({
  providers: [DpoService],
  controllers: [PaymentsController],
  exports: [DpoService],
})
export class PaymentsModule {}