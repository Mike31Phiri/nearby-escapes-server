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
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async updateUser(id, dto, role) {
        const data = {};
        if (dto.fullName) {
            const [firstName, ...rest] = dto.fullName.trim().split(' ');
            data.firstName = firstName;
            data.lastName = rest.join(' ') || '';
        }
        if (dto.phone !== undefined)
            data.phone = dto.phone;
        if (dto.avatarUrl !== undefined)
            data.avatarUrl = dto.avatarUrl;
        if (dto.location !== undefined && role !== client_1.Role.ADMIN) {
            data.location = dto.location;
        }
        if (dto.bio !== undefined && role === client_1.Role.HOST) {
            data.bio = dto.bio;
        }
        const user = await this.prisma.user.update({ where: { id }, data });
        const { password, resetToken, resetTokenExpiry, ...rest } = user;
        return {
            ...rest,
            fullName: `${user.firstName} ${user.lastName}`.trim(),
            role: user.role.toLowerCase().replace('traveler', 'guest'),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map