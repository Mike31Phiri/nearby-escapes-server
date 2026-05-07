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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CollectionsService = class CollectionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(userId) {
        return this.prisma.collection.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    create(userId, dto) {
        const slug = this.toSlug(dto.name);
        return this.prisma.collection.create({
            data: {
                userId,
                name: dto.name,
                stayIds: dto.stayIds ?? [],
                isShared: dto.isShared ?? false,
                slug,
            },
        });
    }
    async update(id, userId, dto) {
        await this.assertOwnership(id, userId);
        const data = { ...dto };
        if (dto.name)
            data.slug = this.toSlug(dto.name);
        return this.prisma.collection.update({ where: { id }, data });
    }
    async remove(id, userId) {
        await this.assertOwnership(id, userId);
        return this.prisma.collection.delete({ where: { id } });
    }
    async findBySlug(slug) {
        const collection = await this.prisma.collection.findUnique({ where: { slug } });
        if (!collection || !collection.isShared)
            throw new common_1.NotFoundException('Collection not found');
        return collection;
    }
    toSlug(name) {
        return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36);
    }
    async assertOwnership(id, userId) {
        const col = await this.prisma.collection.findUnique({ where: { id } });
        if (!col)
            throw new common_1.NotFoundException('Collection not found');
        if (col.userId !== userId)
            throw new common_1.ForbiddenException();
        return col;
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map