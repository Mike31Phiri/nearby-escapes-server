import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Saved Listings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('saved')
export class SavedController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get all saved listings with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of saved listings' })
  async getSaved(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.wishlistService.getSavedListings(user.id, page, limit);
  }

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle listing in saved collection (1-click save/unsave)' })
  @ApiResponse({ status: 200, description: 'Listing save state toggled' })
  async toggleSaved(
    @CurrentUser() user: User,
    @Body('listingId') listingId: string,
  ) {
    return this.wishlistService.toggleSavedListing(user.id, listingId);
  }

  @Delete(':listingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove listing from saved collection' })
  @ApiResponse({ status: 200, description: 'Listing removed from saved collection' })
  async removeSaved(
    @CurrentUser() user: User,
    @Param('listingId') listingId: string,
  ) {
    return this.wishlistService.removeSavedListing(user.id, listingId);
  }
}
