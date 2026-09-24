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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../uploads/s3.service");
let UsersService = class UsersService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async getProfile(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { bookingsAsGuest: { take: 5, orderBy: { createdAt: 'desc' } } },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const reviewStats = await this.prisma.review.aggregate({
            where: { guestId: id },
            _count: { id: true },
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role.toLowerCase(),
            homeCity: user.homeCity,
            bio: user.bio,
            joinedAt: user.createdAt,
            stats: {
                totalBookings: user.bookingsAsGuest.length,
                totalReviews: reviewStats._count.id,
                memberSince: user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            },
        };
    }
    async getPublicProfile(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                homeCity: true,
                bio: true,
                createdAt: true,
                businessName: true,
                isApproved: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            ...user,
            role: user.role.toLowerCase(),
            joinedAt: user.createdAt,
        };
    }
    async updateProfile(id, dto) {
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.phone !== undefined)
            data.phone = dto.phone;
        if (dto.avatar !== undefined)
            data.avatar = dto.avatar;
        if (dto.homeCity !== undefined)
            data.homeCity = dto.homeCity;
        if (dto.bio !== undefined)
            data.bio = dto.bio;
        if (Object.keys(data).length === 0) {
            return this.getProfile(id);
        }
        await this.prisma.user.update({ where: { id }, data });
        return this.getProfile(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], UsersService);
//# sourceMappingURL=users.service.js.map