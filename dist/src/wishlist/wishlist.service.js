"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WishlistService = class WishlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWishlist(userId) {
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
                const ratings = l.reviews?.map((r) => r.rating) || [];
                const avgRating = ratings.length
                    ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
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
    async addItem(userId, listingId, listingType) {
        let wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({ data: { userId } });
        }
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing || listing.deletedAt)
            throw new common_1.NotFoundException('Listing not found');
        await this.prisma.wishlistItem.upsert({
            where: { wishlistId_listingId: { wishlistId: wishlist.id, listingId } },
            create: { wishlistId: wishlist.id, listingId },
            update: {},
        });
        return this.getWishlist(userId);
    }
    async removeItem(userId, listingId) {
        const wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist)
            throw new common_1.NotFoundException('Wishlist not found');
        await this.prisma.wishlistItem.deleteMany({
            where: { wishlistId: wishlist.id, listingId },
        });
        return this.getWishlist(userId);
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map