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
exports.BusesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../uploads/s3.service");
let BusesService = class BusesService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async create(hostId, dto) {
        return this.prisma.bus.create({
            data: {
                ...dto,
                hostId,
                availableSeats: dto.totalSeats,
                departureTime: new Date(dto.departureTime),
                arrivalTime: new Date(dto.arrivalTime),
            },
        });
    }
    findAll() {
        return this.prisma.bus.findMany({ include: { host: { select: { businessName: true } } } });
    }
    async findOne(id) {
        const bus = await this.prisma.bus.findUnique({
            where: { id },
            include: { host: { select: { businessName: true } } },
        });
        if (!bus)
            throw new common_1.NotFoundException('Bus not found');
        return bus;
    }
    async update(id, hostId, dto) {
        await this.assertOwnership(id, hostId);
        const data = { ...dto };
        if (dto.departureTime)
            data.departureTime = new Date(dto.departureTime);
        if (dto.arrivalTime)
            data.arrivalTime = new Date(dto.arrivalTime);
        return this.prisma.bus.update({ where: { id }, data });
    }
    async remove(id, hostId) {
        const bus = await this.assertOwnership(id, hostId);
        if (bus.photos?.length)
            await this.s3.deleteMany(bus.photos);
        return this.prisma.bus.delete({ where: { id } });
    }
    findByHost(hostId) {
        return this.prisma.bus.findMany({ where: { hostId } });
    }
    async assertOwnership(id, hostId) {
        const bus = await this.prisma.bus.findUnique({ where: { id } });
        if (!bus)
            throw new common_1.NotFoundException('Bus not found');
        if (bus.hostId !== hostId)
            throw new common_1.ForbiddenException();
        return bus;
    }
};
exports.BusesService = BusesService;
exports.BusesService = BusesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, s3_service_1.S3Service])
], BusesService);
//# sourceMappingURL=buses.service.js.map