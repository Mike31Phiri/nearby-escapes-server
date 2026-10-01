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

  // ─── Saved / Wishlist API (Frontend Alignment) ─────────────────────────────

  async getSavedListings(userId: string, page: number = 1, limit: number = 12) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 12));
    const skip = (safePage - 1) * safeLimit;

    let wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({ data: { userId } });
    }

    const [items, total] = await Promise.all([
      this.prisma.wishlistItem.findMany({
        where: { wishlistId: wishlist.id },
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              stays: { where: { deletedAt: null, isActive: true }, take: 1 },
              experiences: { where: { deletedAt: null, isActive: true }, take: 1 },
              transports: { where: { deletedAt: null, isActive: true }, take: 1 },
              reviews: { select: { rating: true } },
            },
          },
        },
      }),
      this.prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } }),
    ]);

    const data = items.map((item) => {
      const p = item.property;
      const ratings = p.reviews?.map((r: any) => r.rating) || [];
      const avgRating = ratings.length
        ? Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
        : 0;

      const price =
        p.stays?.[0]?.price ??
        p.experiences?.[0]?.price ??
        p.transports?.[0]?.pricePerSeat ??
        0;

      const locationParts = (p.location || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const city = locationParts[0] || null;
      const province = locationParts.length > 1 ? locationParts[locationParts.length - 1] : null;

      return {
        id: item.id,
        listingId: p.id,
        vertical: p.type.toLowerCase(),
        title: p.name,
        city,
        province,
        featuredImage: p.images?.[0]?.url || null,
        pricePerUnitNgwee: price,
        currency: p.currency,
        rating: avgRating,
        reviewCount: ratings.length,
        savedAt: item.createdAt.toISOString(),
      };
    });

    return {
      data,
      total,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async toggleSavedListing(userId: string, listingId: string) {
    let wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({ data: { userId } });
    }

    const property = await this.prisma.property.findUnique({
      where: { id: listingId },
      select: { id: true, deletedAt: true },
    });
    if (!property || property.deletedAt) throw new NotFoundException('Listing not found');

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { wishlistId_propertyId: { wishlistId: wishlist.id, propertyId: listingId } },
    });

    let saved = false;
    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      saved = false;
    } else {
      await this.prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, propertyId: listingId },
      });
      saved = true;
    }

    const totalSaved = await this.prisma.wishlistItem.count({
      where: { wishlistId: wishlist.id },
    });

    return {
      saved,
      listingId,
      totalSaved,
    };
  }

  async removeSavedListing(userId: string, listingId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (wishlist) {
      await this.prisma.wishlistItem.deleteMany({
        where: { wishlistId: wishlist.id, propertyId: listingId },
      });
    }

    return {
      success: true,
      message: 'Listing removed from saved collection.',
    };
  }
}

