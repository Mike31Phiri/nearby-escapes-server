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
    async getPropertyAvailability(propertyId, year, month) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                stays: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
                experiences: { where: { deletedAt: null } },
                transports: { where: { deletedAt: null } },
            },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        if (property.type === 'STAY') {
            const activeStays = property.stays.filter((s) => s.isActive);
            const draftData = property.draftData || {};
            const totalInventory = draftData.inventoryCount || activeStays.length || 1;
            const y = year || new Date().getFullYear();
            const m = month || new Date().getMonth() + 1;
            const startDate = new Date(y, m - 1, 1);
            const endDate = new Date(y, m, 0, 23, 59, 59);
            const stayIds = activeStays.map((s) => s.id);
            const slots = await this.prisma.availabilitySlot.findMany({
                where: {
                    stayId: { in: stayIds },
                    date: { gte: startDate, lte: endDate },
                },
            });
            const now = new Date();
            const bookings = await this.prisma.booking.findMany({
                where: {
                    propertyId,
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
            const basePrice = activeStays[0]?.price || draftData.pricePerUnitNgwee || 100000;
            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const dateBookings = bookings.filter((b) => {
                    if (!b.checkIn || !b.checkOut)
                        return false;
                    const ci = b.checkIn.toISOString().split('T')[0];
                    const co = b.checkOut.toISOString().split('T')[0];
                    return dateStr >= ci && dateStr < co;
                });
                const bookedCount = dateBookings.length;
                const blockedSlots = slots.filter((s) => s.date.toISOString().split('T')[0] === dateStr && s.status === 'blocked');
                const blockedCount = blockedSlots.length;
                const availableCount = Math.max(0, totalInventory - bookedCount - blockedCount);
                const available = availableCount > 0;
                let status = 'available';
                if (blockedCount >= totalInventory && totalInventory > 0) {
                    status = 'blocked';
                }
                else if (availableCount === 0) {
                    status = 'booked';
                }
                else if (dateBookings.some((b) => b.status === 'PENDING')) {
                    status = 'partially_held';
                }
                daySlots.push({
                    propertyId: property.id,
                    propertyName: property.name,
                    date: dateStr,
                    totalInventory,
                    bookedCount,
                    blockedCount,
                    availableCount,
                    available,
                    status,
                    price: basePrice,
                    priceFormatted: `K${(basePrice / 100).toFixed(2)}`,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return {
                propertyId: property.id,
                propertyName: property.name,
                vertical: 'stay',
                totalInventory,
                year: y,
                month: m,
                days: daySlots,
            };
        }
        if (property.type === 'EXPERIENCE' && property.experiences.length > 0) {
            const exp = property.experiences[0];
            const todayStr = new Date().toISOString().split('T')[0];
            return this.getExperienceAvailability(exp.id, todayStr);
        }
        if (property.type === 'TRANSPORT' && property.transports.length > 0) {
            const trans = property.transports[0];
            const todayStr = new Date().toISOString().split('T')[0];
            return this.getTransportAvailability(trans.id, todayStr);
        }
        throw new common_1.BadRequestException('No active bookable units found for property');
    }
    async getStayAvailability(stayId, year, month) {
        const stay = await this.prisma.stay.findUnique({
            where: { id: stayId },
            include: { property: true },
        });
        if (!stay) {
            const prop = await this.prisma.property.findUnique({ where: { id: stayId } });
            if (prop) {
                return this.getPropertyAvailability(prop.id, year, month);
            }
            throw new common_1.NotFoundException('Stay unit or Property not found');
        }
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
                listingId: stay.propertyId,
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
    async getAvailability(id, year, month) {
        const property = await this.prisma.property.findUnique({ where: { id } });
        if (property) {
            return this.getPropertyAvailability(id, year, month);
        }
        return this.getStayAvailability(id, year, month);
    }
    async getExperienceAvailability(propertyOrExpId, dateStr) {
        const experience = await this.prisma.experience.findFirst({
            where: {
                OR: [{ id: propertyOrExpId }, { propertyId: propertyOrExpId }],
            },
            include: {
                timeSlots: { orderBy: { slot: 'asc' } },
                property: true,
            },
        });
        if (!experience)
            throw new common_1.NotFoundException('Experience not found');
        const date = new Date(dateStr);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
        const now = new Date();
        const bookings = await this.prisma.booking.findMany({
            where: {
                experienceId: experience.id,
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
        const maxCapacity = experience.maxParticipants || 10;
        const propDraftData = experience.property.draftData || {};
        const blockedSlotsForDate = propDraftData.blockedSlots?.[dateStr] || [];
        const slots = (experience.timeSlots || []).map((slotObj) => {
            const slotName = slotObj.slot;
            const isManuallyBlocked = blockedSlotsForDate.includes(slotName);
            const slotBookings = bookings.filter((b) => b.timeSlot === slotName);
            const bookedGuests = slotBookings.reduce((sum, b) => sum + b.guests, 0);
            const activeHold = slotBookings.find((b) => b.status === 'PENDING' && b.expiresAt && b.expiresAt > now);
            const remainingSpots = Math.max(0, maxCapacity - bookedGuests);
            let available = remainingSpots > 0 && !isManuallyBlocked;
            let status = 'available';
            if (isManuallyBlocked) {
                status = 'blocked';
                available = false;
            }
            else if (!available) {
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
                remainingSpots: isManuallyBlocked ? 0 : remainingSpots,
                isBlocked: isManuallyBlocked,
                isHeld: !!activeHold,
                holdExpiresAt: activeHold?.expiresAt ? activeHold.expiresAt.toISOString() : null,
                price: experience.price,
                priceFormatted: `K${(experience.price / 100).toFixed(2)}`,
            };
        });
        const totalSlotsCount = slots.length;
        const availableSlotsCount = slots.filter((s) => s.available).length;
        const unavailableSlotsCount = totalSlotsCount - availableSlotsCount;
        return {
            experienceId: experience.id,
            propertyId: experience.propertyId,
            name: experience.name,
            date: dateStr,
            totalSlotsCount,
            availableSlotsCount,
            unavailableSlotsCount,
            slots,
        };
    }
    async blockExperienceSlot(dto, userId) {
        const id = dto.experienceId || dto.propertyId;
        if (!id)
            throw new common_1.BadRequestException('experienceId or propertyId is required');
        const experience = await this.prisma.experience.findFirst({
            where: { OR: [{ id }, { propertyId: id }] },
            include: { property: true },
        });
        if (!experience)
            throw new common_1.NotFoundException('Experience not found');
        if (experience.property.hostId !== userId) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN')
                throw new common_1.ForbiddenException();
        }
        const draftData = experience.property.draftData || {};
        const blockedSlots = draftData.blockedSlots || {};
        const currentList = blockedSlots[dto.date] || [];
        if (!currentList.includes(dto.slot)) {
            currentList.push(dto.slot);
        }
        blockedSlots[dto.date] = currentList;
        await this.prisma.property.update({
            where: { id: experience.propertyId },
            data: {
                draftData: {
                    ...draftData,
                    blockedSlots,
                },
            },
        });
        return {
            success: true,
            message: `Slot ${dto.slot} blocked on ${dto.date}`,
        };
    }
    async unblockExperienceSlot(dto, userId) {
        const id = dto.experienceId || dto.propertyId;
        if (!id)
            throw new common_1.BadRequestException('experienceId or propertyId is required');
        const experience = await this.prisma.experience.findFirst({
            where: { OR: [{ id }, { propertyId: id }] },
            include: { property: true },
        });
        if (!experience)
            throw new common_1.NotFoundException('Experience not found');
        if (experience.property.hostId !== userId) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN')
                throw new common_1.ForbiddenException();
        }
        const draftData = experience.property.draftData || {};
        const blockedSlots = draftData.blockedSlots || {};
        const currentList = blockedSlots[dto.date] || [];
        blockedSlots[dto.date] = currentList.filter((s) => s !== dto.slot);
        await this.prisma.property.update({
            where: { id: experience.propertyId },
            data: {
                draftData: {
                    ...draftData,
                    blockedSlots,
                },
            },
        });
        return {
            success: true,
            message: `Slot ${dto.slot} unblocked on ${dto.date}`,
        };
    }
    async getTransportAvailability(transportIdOrPropId, dateStr) {
        const transport = await this.prisma.transport.findFirst({
            where: {
                OR: [{ id: transportIdOrPropId }, { propertyId: transportIdOrPropId }],
            },
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
                transportId: transport.id,
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
        const vehicleTypeLower = (transport.vehicleType || '').toLowerCase();
        const isRentalCar = vehicleTypeLower.includes('rental') ||
            vehicleTypeLower.includes('car') ||
            vehicleTypeLower.includes('suv') ||
            vehicleTypeLower.includes('sedan') ||
            vehicleTypeLower.includes('4x4');
        const fleet = transport.schedule?.fleet;
        const isFleetDefined = Array.isArray(fleet) && fleet.length > 0;
        if (isRentalCar || isFleetDefined) {
            const totalVehicles = isFleetDefined
                ? fleet.length
                : transport.capacity && transport.capacity <= 5
                    ? transport.capacity
                    : 1;
            const bookedVehicles = bookings.length;
            const availableVehicles = Math.max(0, totalVehicles - bookedVehicles);
            const available = availableVehicles > 0;
            return {
                transportId: transport.id,
                propertyId: transport.propertyId,
                name: transport.name,
                vehicleType: transport.vehicleType,
                inventoryType: 'vehicles',
                date: dateStr,
                available,
                totalVehicles,
                bookedVehicles,
                availableVehicles,
                pricePerUnit: transport.pricePerSeat,
                priceFormatted: transport.pricePerSeat ? `K${(transport.pricePerSeat / 100).toFixed(2)}` : 'K0.00',
            };
        }
        const totalCapacity = transport.capacity || 50;
        const bookedSeats = bookings.reduce((sum, b) => sum + b.guests, 0);
        const remainingSeats = Math.max(0, totalCapacity - bookedSeats);
        const available = remainingSeats > 0;
        return {
            transportId: transport.id,
            propertyId: transport.propertyId,
            name: transport.name,
            vehicleType: transport.vehicleType,
            inventoryType: 'seats',
            date: dateStr,
            available,
            capacity: totalCapacity,
            totalSeats: totalCapacity,
            bookedSeats,
            remainingSeats,
            pricePerSeat: transport.pricePerSeat,
            priceFormatted: transport.pricePerSeat ? `K${(transport.pricePerSeat / 100).toFixed(2)}` : 'K0.00',
            schedule: transport.schedule,
        };
    }
    async resolveStayUnits(listingId, unitId, stayId, userId) {
        const directUnitId = unitId || stayId;
        if (directUnitId) {
            const stay = await this.prisma.stay.findUnique({
                where: { id: directUnitId },
                include: { property: true },
            });
            if (stay) {
                if (userId && stay.property.hostId !== userId) {
                    const user = await this.prisma.user.findUnique({ where: { id: userId } });
                    if (user?.role !== 'ADMIN') {
                        throw new common_1.ForbiddenException('Only the host of this property can manage availability');
                    }
                }
                return [stay.id];
            }
        }
        const propId = listingId || directUnitId;
        if (propId) {
            const property = await this.prisma.property.findUnique({
                where: { id: propId },
                include: { stays: { where: { deletedAt: null } } },
            });
            if (property) {
                if (userId && property.hostId !== userId) {
                    const user = await this.prisma.user.findUnique({ where: { id: userId } });
                    if (user?.role !== 'ADMIN') {
                        throw new common_1.ForbiddenException('Only the host of this property can manage availability');
                    }
                }
                if (property.stays.length > 0) {
                    return property.stays.map((s) => s.id);
                }
            }
        }
        throw new common_1.NotFoundException('Stay unit or listing not found');
    }
    async blockDates(dto, userId) {
        const rawDto = dto;
        const startDateStr = rawDto.startDate || rawDto.dateFrom;
        const endDateStr = rawDto.endDate || rawDto.dateTo;
        if (!startDateStr || !endDateStr) {
            throw new common_1.BadRequestException('startDate and endDate (or dateFrom and dateTo) are required');
        }
        const stayIds = await this.resolveStayUnits(rawDto.propertyId || rawDto.listingId, rawDto.unitId, rawDto.stayId, userId);
        const targetStayIds = rawDto.count && rawDto.count > 0 && rawDto.count < stayIds.length
            ? stayIds.slice(0, rawDto.count)
            : stayIds;
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        for (const stayId of targetStayIds) {
            const current = new Date(start);
            while (current <= end) {
                const slotDate = new Date(current);
                slotDate.setHours(0, 0, 0, 0);
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
        }
        return {
            success: true,
            message: `Blocked dates from ${startDateStr} to ${endDateStr} (${targetStayIds.length} inventory units)`,
        };
    }
    async unblockDates(dto, userId) {
        const rawDto = dto;
        const startDateStr = rawDto.startDate || rawDto.dateFrom;
        const endDateStr = rawDto.endDate || rawDto.dateTo;
        if (!startDateStr || !endDateStr) {
            throw new common_1.BadRequestException('startDate and endDate (or dateFrom and dateTo) are required');
        }
        const stayIds = await this.resolveStayUnits(rawDto.propertyId || rawDto.listingId, rawDto.unitId, rawDto.stayId, userId);
        const targetStayIds = rawDto.count && rawDto.count > 0 && rawDto.count < stayIds.length
            ? stayIds.slice(0, rawDto.count)
            : stayIds;
        const start = new Date(startDateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
        const deleted = await this.prisma.availabilitySlot.deleteMany({
            where: {
                stayId: { in: targetStayIds },
                date: { gte: start, lte: end },
                status: 'blocked',
            },
        });
        return {
            success: true,
            message: `Unblocked ${deleted.count} unit dates`,
        };
    }
    async addSeasonalPricing(dto, userId) {
        const stayIds = await this.resolveStayUnits(dto.listingId, undefined, dto.stayId, userId);
        const stayId = stayIds[0];
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
        await this.resolveStayUnits(pricing.stay.propertyId, pricing.stayId, undefined, userId);
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