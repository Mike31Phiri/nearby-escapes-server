import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: "Current user's wishlist" })
  getWishlist(@CurrentUser() user: User) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add listing to wishlist' })
  addItem(@CurrentUser() user: User, @Body('listingId') listingId: string, @Body('listingType') listingType: string) {
    return this.wishlistService.addItem(user.id, listingId, listingType);
  }

  @Delete('remove/:listingId')
  @ApiOperation({ summary: 'Remove from wishlist' })
  removeItem(@CurrentUser() user: User, @Param('listingId') listingId: string) {
    return this.wishlistService.removeItem(user.id, listingId);
  }
}
