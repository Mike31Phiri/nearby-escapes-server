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
exports.HostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HostsService = class HostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createHost(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === 'HOST')
            throw new common_1.BadRequestException('Already registered as a host');
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                role: 'HOST',
                businessName: dto.businessName,
                isApproved: false,
            },
        });
        return {
            id: updated.id,
            userId: updated.id,
            displayName: updated.name,
            businessName: updated.businessName,
            verified: updated.isApproved,
        };
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id, role: 'HOST' },
            select: { id: true, name: true, email: true, avatar: true, businessName: true, isApproved: true, createdAt: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Host not found');
        return user;
    }
    async findByUserId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, avatar: true, businessName: true, isApproved: true, role: true },
        });
        if (!user || user.role !== 'HOST')
            throw new common_1.NotFoundException('Host profile not found');
        return user;
    }
    async getHostStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, businessName: true, isApproved: true },
        });
        if (!user || user.role !== 'HOST') {
            return {
                hasProfile: false,
                isApproved: false,
                hostId: null,
                businessName: null,
                role: 'guest',
            };
        }
        return {
            hasProfile: true,
            isApproved: user.isApproved,
            hostId: userId,
            businessName: user.businessName,
            role: user.isApproved ? 'host' : 'host_pending',
        };
    }
    async findApprovedByUserId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, avatar: true, businessName: true, isApproved: true, role: true },
        });
        if (!user || user.role !== 'HOST')
            throw new common_1.NotFoundException('Host profile not found');
        if (!user.isApproved)
            throw new common_1.ForbiddenException('Your host account is pending admin approval');
        return user;
    }
    async getHostSettings(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                businessName: true,
                defaultCheckInTime: true,
                defaultCheckOutTime: true,
                payoutMethod: true,
                payoutAccount: true,
                isApproved: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            businessName: user.businessName,
            defaultCheckInTime: user.defaultCheckInTime || '14:00',
            defaultCheckOutTime: user.defaultCheckOutTime || '10:00',
            payoutMethod: user.payoutMethod || 'BANK_TRANSFER',
            payoutAccount: user.payoutAccount,
            isApproved: user.isApproved,
        };
    }
    async updateHostSettings(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.defaultCheckInTime ? { defaultCheckInTime: dto.defaultCheckInTime } : {}),
                ...(dto.defaultCheckOutTime ? { defaultCheckOutTime: dto.defaultCheckOutTime } : {}),
                ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
                ...(dto.payoutMethod !== undefined ? { payoutMethod: dto.payoutMethod } : {}),
                ...(dto.payoutAccount !== undefined ? { payoutAccount: dto.payoutAccount } : {}),
            },
            select: {
                id: true,
                businessName: true,
                defaultCheckInTime: true,
                defaultCheckOutTime: true,
                payoutMethod: true,
                payoutAccount: true,
                isApproved: true,
            },
        });
        return {
            message: 'Host settings updated successfully',
            settings: {
                businessName: updated.businessName,
                defaultCheckInTime: updated.defaultCheckInTime || '14:00',
                defaultCheckOutTime: updated.defaultCheckOutTime || '10:00',
                payoutMethod: updated.payoutMethod || 'BANK_TRANSFER',
                payoutAccount: updated.payoutAccount,
                isApproved: updated.isApproved,
            },
        };
    }
};
exports.HostsService = HostsService;
exports.HostsService = HostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HostsService);
//# sourceMappingURL=hosts.service.js.map