import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                host: { include: { user: { select: { name: true } } } },
                reviews: { select: { rating: true } },
                _count: { select: { reviews: true } },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  host: { include: { user: { select: { name: true } } } },
                  reviews: { select: { rating: true } },
                  _count: { select: { reviews: true } },
                },
              },
            },
          },
        },
      });
    }

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      items: wishlist.items.map((item) => {
        const l = item.listing;
        const ratings = l.reviews?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length
          ? Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
          : 0;
        return {
          id: l.id,
          type: l.type.toLowerCase(),
          name: l.name,
          description: l.description,
          location: l.location,
          images: l.images,
          price: l.price,
          currency: l.currency,
          rating: avgRating,
          reviewCount: l._count?.reviews || 0,
          hostName: l.host?.user?.name || null,
          createdAt: l.createdAt,
        };
      }),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  async addItem(userId: string, listingId: string, listingType: string) {
    // Ensure wishlist exists
    let wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({ data: { userId } });
    }

    // Check listing exists
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.deletedAt) throw new NotFoundException('Listing not found');

    // Add item (skip if already exists)
    await this.prisma.wishlistItem.upsert({
      where: { wishlistId_listingId: { wishlistId: wishlist.id, listingId } },
      create: { wishlistId: wishlist.id, listingId },
      update: {},
    });

    return this.getWishlist(userId);
  }

  async removeItem(userId: string, listingId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, listingId },
    });

    return this.getWishlist(userId);
  }
}
