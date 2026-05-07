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
exports.PackagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../uploads/s3.service");
let PackagesService = class PackagesService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async create(hostId, dto) {
        return this.prisma.package.create({
            data: {
                hostId,
                name: dto.name,
                description: dto.description,
                totalPrice: dto.totalPrice,
                items: { create: dto.items },
            },
            include: { items: true },
        });
    }
    findAll() {
        return this.prisma.package.findMany({
            include: { items: true, host: { select: { businessName: true } } },
        });
    }
    async findOne(id) {
        const pkg = await this.prisma.package.findUnique({
            where: { id },
            include: { items: true, host: { select: { businessName: true } } },
        });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        return pkg;
    }
    async update(id, hostId, dto) {
        await this.assertOwnership(id, hostId);
        const { items, ...rest } = dto;
        return this.prisma.package.update({
            where: { id },
            data: {
                ...rest,
                ...(items && { items: { deleteMany: {}, create: items } }),
            },
            include: { items: true },
        });
    }
    async remove(id, hostId) {
        const pkg = await this.assertOwnership(id, hostId);
        if (pkg.photos?.length)
            await this.s3.deleteMany(pkg.photos);
        return this.prisma.package.delete({ where: { id } });
    }
    findByHost(hostId) {
        return this.prisma.package.findMany({ where: { hostId }, include: { items: true } });
    }
    async assertOwnership(id, hostId) {
        const pkg = await this.prisma.package.findUnique({ where: { id } });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        if (pkg.hostId !== hostId)
            throw new common_1.ForbiddenException();
        return pkg;
    }
};
exports.PackagesService = PackagesService;
exports.PackagesService = PackagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, s3_service_1.S3Service])
], PackagesService);
//# sourceMappingURL=packages.service.js.map