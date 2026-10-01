import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { SavedController } from './saved.controller';

@Module({
  providers: [WishlistService],
  controllers: [WishlistController, SavedController],
  exports: [WishlistService],
})
export class WishlistModule {}
