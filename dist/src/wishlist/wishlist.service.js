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
                const price = p.stays?.[0]?.price ??
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
                    thumbnailUrl: p.images?.[0]?.url || null,
                    price,
                    priceFormatted: `K${(price / 100).toFixed(2)}`,
                    currency: p.currency,
                    reviewCount: p._count?.reviews || 0,
                    hostName: p.host?.businessName || p.host?.name || null,
                    createdAt: p.createdAt,
                };
            }),
            createdAt: wishlist.createdAt,
            updatedAt: wishlist.updatedAt,
        };
    }
    async addItem(userId, propertyId, _type) {
        let wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({ data: { userId } });
        }
        const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property || property.deletedAt)
            throw new common_1.NotFoundException('Property not found');
        await this.prisma.wishlistItem.upsert({
            where: { wishlistId_propertyId: { wishlistId: wishlist.id, propertyId } },
            create: { wishlistId: wishlist.id, propertyId },
            update: {},
        });
        return this.getWishlist(userId);
    }
    async removeItem(userId, propertyId) {
        const wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist)
            throw new common_1.NotFoundException('Wishlist not found');
        await this.prisma.wishlistItem.deleteMany({
            where: { wishlistId: wishlist.id, propertyId },
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