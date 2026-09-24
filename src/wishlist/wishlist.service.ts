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
            property: {
              include: {
                host: { select: { name: true, businessName: true } },
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                stays: { where: { deletedAt: null, isActive: true }, take: 1 },
                experiences: { where: { deletedAt: null, isActive: true }, take: 1 },
                transports: { where: { deletedAt: null, isActive: true }, take: 1 },
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
              property: {
                include: {
                  host: { select: { name: true, businessName: true } },
                  images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  stays: { where: { deletedAt: null, isActive: true }, take: 1 },
                  experiences: { where: { deletedAt: null, isActive: true }, take: 1 },
                  transports: { where: { deletedAt: null, isActive: true }, take: 1 },
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
        const p = item.property;
        const price =
          p.stays?.[0]?.price ??
          p.experiences?.[0]?.price ??
          p.transports?.[0]?.pricePerSeat ??
          0;
        return {
          id: p.id,
          propertyId: p.id,
          listingId: p.id,
          type: p.type.toLowerCase(),
          name: p.name,
          description: p.description,
          location: p.location,
          thumbnailUrl: (p as any).images?.[0]?.url || null,
          price,
          priceFormatted: `K${(price / 100).toFixed(2)}`,
          currency: p.currency,
          reviewCount: p._count?.reviews || 0,
          hostName: (p as any).host?.businessName || (p as any).host?.name || null,
          createdAt: p.createdAt,
        };
      }),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  async addItem(userId: string, propertyId: string, _type?: string) {
    // Ensure wishlist exists
    let wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({ data: { userId } });
    }

    // Check property exists
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.deletedAt) throw new NotFoundException('Property not found');

    // Add item (skip if already exists)
    await this.prisma.wishlistItem.upsert({
      where: { wishlistId_propertyId: { wishlistId: wishlist.id, propertyId } },
      create: { wishlistId: wishlist.id, propertyId },
      update: {},
    });

    return this.getWishlist(userId);
  }

  async removeItem(userId: string, propertyId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, propertyId },
    });

    return this.getWishlist(userId);
  }
}
