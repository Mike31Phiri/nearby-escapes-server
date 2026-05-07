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
exports.AccommodationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../uploads/s3.service");
let AccommodationsService = class AccommodationsService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async create(hostId, dto) {
        return this.prisma.accommodation.create({
            data: { ...dto, hostId, availableRooms: dto.totalRooms },
        });
    }
    findAll() {
        return this.prisma.accommodation.findMany({ include: { host: { select: { businessName: true } } } });
    }
    async findOne(id) {
        const accommodation = await this.prisma.accommodation.findUnique({
            where: { id },
            include: { host: { select: { businessName: true } } },
        });
        if (!accommodation)
            throw new common_1.NotFoundException('Accommodation not found');
        return accommodation;
    }
    async update(id, hostId, dto) {
        await this.assertOwnership(id, hostId);
        return this.prisma.accommodation.update({ where: { id }, data: dto });
    }
    async remove(id, hostId) {
        const accommodation = await this.assertOwnership(id, hostId);
        if (accommodation.photos?.length)
            await this.s3.deleteMany(accommodation.photos);
        return this.prisma.accommodation.delete({ where: { id } });
    }
    findByHost(hostId) {
        return this.prisma.accommodation.findMany({ where: { hostId } });
    }
    async assertOwnership(id, hostId) {
        const accommodation = await this.prisma.accommodation.findUnique({ where: { id } });
        if (!accommodation)
            throw new common_1.NotFoundException('Accommodation not found');
        if (accommodation.hostId !== hostId)
            throw new common_1.ForbiddenException();
        return accommodation;
    }
};
exports.AccommodationsService = AccommodationsService;
exports.AccommodationsService = AccommodationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, s3_service_1.S3Service])
], AccommodationsService);
//# sourceMappingURL=accommodations.service.js.map