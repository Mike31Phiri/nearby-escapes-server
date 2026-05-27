import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from '../uploads/s3.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UsersService, S3Service],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
