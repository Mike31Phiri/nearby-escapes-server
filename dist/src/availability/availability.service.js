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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AvailabilityService = class AvailabilityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStayAvailability(stayId, year, month) {
        const stay = await this.prisma.stay.findUnique({
            where: { id: stayId },
            include: { property: true },
        });
        if (!stay)
            throw new common_1.NotFoundException('Stay unit not found');
        const startDate = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);
        const slots = await this.prisma.availabilitySlot.findMany({
            where: {
                stayId,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: 'asc' },
        });
        const now = new Date();
        const bookings = await this.prisma.booking.findMany({
            where: {
                stayId,
                OR: [
                    { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
                    { status: 'PENDING', expiresAt: { gt: now } },
                ],
                AND: [
                    { checkIn: { lte: endDate } },
                    { checkOut: { gte: startDate } },
                ],
            },
            select: {
                id: true,
                checkIn: true,
                checkOut: true,
                status: true,
                expiresAt: true,
            },
        });
        const daySlots = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const existingSlot = slots.find((s) => s.date.toISOString().split('T')[0] === dateStr);
            const activeBooking = bookings.find((b) => {
                if (!b.checkIn || !b.checkOut)
                    return false;
                const ci = b.checkIn.toISOString().split('T')[0];
                const co = b.checkOut.toISOString().split('T')[0];
                return dateStr >= ci && dateStr < co;
            });
            let status = 'available';
            let available = true;
            let holdExpiresAt = null;
            if (existingSlot?.status === 'blocked') {
                status = 'blocked';
                available = false;
            }
            else if (activeBooking) {
                if (activeBooking.status === 'CONFIRMED' || activeBooking.status === 'CHECKED_IN') {
                    status = 'booked';
                    available = false;
                }
                else if (activeBooking.status === 'PENDING') {
                    status = 'held';
                    available = false;
                    holdExpiresAt = activeBooking.expiresAt ? activeBooking.expiresAt.toISOString() : null;
                }
            }
            daySlots.push({
                stayId,
                listingId: stayId,
                propertyId: stay.propertyId,
                date: dateStr,
                available,
                status,
                holdExpiresAt,
                price: existingSlot?.price || stay.price,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return daySlots;
    }
    async getAvailability(stayId, year, month) {
        return this.getStayAvailability(stayId, year, month);
    }
    async getExperienceAvailability(experienceId, dateStr) {
        const experience = await this.prisma.experience.findUnique({
            where: { id: experienceId },
            include: {
                timeSlots: { orderBy: { slot: 'asc' } },
                property: true,
            },
        });
        if (!experience)
            throw new common_1.NotFoundException('Experience unit not found');
        const date = new Date(dateStr);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
        const now = new Date();
        const bookings = await this.prisma.booking.findMany({
            where: {
                experienceId,
                date: { gte: startOfDay, lte: endOfDay },
                OR: [
                    { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
                    { status: 'PENDING', expiresAt: { gt: now } },
                ],
            },
            select: {
                id: true,
                timeSlot: true,
                guests: true,
                status: true,
                expiresAt: true,
            },
        });
        const maxCapacity = experience.maxParticipants || 1;
        const slots = (experience.timeSlots || []).map((slotObj) => {
            const slotName = slotObj.slot;
            const slotBookings = bookings.filter((b) => b.timeSlot === slotName);
            const bookedGuests = slotBookings.reduce((sum, b) => sum + b.guests, 0);
            const activeHold = slotBookings.find((b) => b.status === 'PENDING' && b.expiresAt && b.expiresAt > now);
            const remainingSpots = Math.max(0, maxCapacity - bookedGuests);
            const available = remainingSpots > 0;
            let status = 'available';
            if (!available) {
                status = activeHold ? 'held' : 'booked';
            }
            else if (activeHold) {
                status = 'partially_held';
            }
            return {
                slot: slotName,
                available,
                status,
                capacity: maxCapacity,
                bookedSpots: bookedGuests,
                remainingSpots,
                isHeld: !!activeHold,
                holdExpiresAt: activeHold?.expiresAt ? activeHold.expiresAt.toISOString() : null,
                price: experience.price,
                priceFormatted: `K${(experience.price / 100).toFixed(2)}`,
            };
        });
        return {
            experienceId: experience.id,
            propertyId: experience.propertyId,
            name: experience.name,
            date: dateStr,
            slots,
        };
    }
    async getTransportAvailability(transportId, dateStr) {
        const transport = await this.prisma.transport.findUnique({
            where: { id: transportId },
            include: { property: true },
        });
        if (!transport)
            throw new common_1.NotFoundException('Transport unit not found');
        const date = new Date(dateStr);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
        const now = new Date();
        const bookings = await this.prisma.booking.findMany({
            where: {
                transportId,
                date: { gte: startOfDay, lte: endOfDay },
                OR: [
                    { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
                    { status: 'PENDING', expiresAt: { gt: now } },
                ],
            },
            select: {
                id: true,
                guests: true,
                status: true,
                expiresAt: true,
            },
        });
        const totalCapacity = transport.capacity || 50;
        const bookedSeats = bookings.reduce((sum, b) => sum + b.guests, 0);
        const remainingSeats = Math.max(0, totalCapacity - bookedSeats);
        const available = remainingSeats > 0;
        return {
            transportId: transport.id,
            propertyId: transport.propertyId,
            name: transport.name,
            date: dateStr,
            available,
            capacity: totalCapacity,
            bookedSeats,
            remainingSeats,
            pricePerSeat: transport.pricePerSeat,
            priceFormatted: transport.pricePerSeat ? `K${(transport.pricePerSeat / 100).toFixed(2)}` : 'K0.00',
            schedule: transport.schedule,
        };
    }
    async blockDates(dto, userId) {
        const stayId = dto.stayId || dto.listingId;
        if (!stayId)
            throw new common_1.BadRequestException('stayId (or listingId) is required');
        await this.assertStayOwnership(stayId, userId);
        const start = new Date(dto.dateFrom);
        const end = new Date(dto.dateTo);
        const current = new Date(start);
        while (current <= end) {
            const slotDate = new Date(current);
            await this.prisma.availabilitySlot.upsert({
                where: { stayId_date: { stayId, date: slotDate } },
                update: { status: 'blocked' },
                create: {
                    stayId,
                    date: slotDate,
                    status: 'blocked',
                },
            });
            current.setDate(current.getDate() + 1);
        }
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return { message: `Blocked ${totalDays} days from ${dto.dateFrom} to ${dto.dateTo}` };
    }
    async unblockDates(dto, userId) {
        const stayId = dto.stayId || dto.listingId;
        if (!stayId)
            throw new common_1.BadRequestException('stayId (or listingId) is required');
        await this.assertStayOwnership(stayId, userId);
        const start = new Date(dto.dateFrom);
        const end = new Date(dto.dateTo);
        const deleted = await this.prisma.availabilitySlot.deleteMany({
            where: {
                stayId,
                date: { gte: start, lte: end },
                status: 'blocked',
            },
        });
        return { message: `Unblocked ${deleted.count} days` };
    }
    async addSeasonalPricing(dto, userId) {
        const stayId = dto.stayId || dto.listingId;
        if (!stayId)
            throw new common_1.BadRequestException('stayId (or listingId) is required');
        await this.assertStayOwnership(stayId, userId);
        return this.prisma.seasonalPricing.create({
            data: {
                stayId,
                from: new Date(dto.from),
                to: new Date(dto.to),
                price: dto.price,
                label: dto.label || null,
            },
        });
    }
    async removeSeasonalPricing(id, userId) {
        const pricing = await this.prisma.seasonalPricing.findUnique({
            where: { id },
            include: { stay: { include: { property: true } } },
        });
        if (!pricing)
            throw new common_1.NotFoundException('Seasonal pricing not found');
        await this.assertStayOwnership(pricing.stayId, userId);
        return this.prisma.seasonalPricing.delete({ where: { id } });
    }
    async assertStayOwnership(stayId, userId) {
        const stay = await this.prisma.stay.findUnique({
            where: { id: stayId },
            include: { property: true },
        });
        if (!stay || stay.property.hostId !== userId) {
            throw new common_1.NotFoundException('Stay unit not found');
        }
        return stay;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map