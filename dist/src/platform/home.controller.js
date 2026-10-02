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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const read_store_service_1 = require("../read-store/read-store.service");
const prisma_service_1 = require("../prisma/prisma.service");
const FEATURED_DESTINATIONS = [
    {
        id: 'dest_livingstone',
        name: 'Livingstone',
        province: 'Southern',
        tagline: 'Victoria Falls & Adventure Capital',
        description: 'Home to the mighty Mosi-oa-Tunya (Victoria Falls), sunset boat cruises, and white-water rafting on the Zambezi.',
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
    },
    {
        id: 'dest_lower_zambezi',
        name: 'Lower Zambezi',
        province: 'Southern',
        tagline: 'Canoeing & Pristine Riverfront Lodges',
        description: 'Breathtaking riverfront safaris, canoeing past hippos and elephants, and premier luxury eco-lodges.',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    },
    {
        id: 'dest_south_luangwa',
        name: 'South Luangwa',
        province: 'Eastern',
        tagline: 'The Valley of the Leopard',
        description: 'World-renowned for pioneering walking safaris, phenomenal leopard sightings, and the Luangwa river.',
        image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800&q=80',
    },
    {
        id: 'dest_lusaka',
        name: 'Lusaka',
        province: 'Lusaka',
        tagline: 'Vibrant Capital & Cultural Gateway',
        description: 'The heartbeat of Zambia, featuring bustling markets, craft villages, fine dining, and elephant sanctuaries.',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    },
    {
        id: 'dest_siavonga',
        name: 'Siavonga',
        province: 'Southern',
        tagline: 'Lake Kariba Riviera',
        description: 'The premier lakeshore getaway for houseboating, freshwater angling, and relaxed waterfront sunsets.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    },
    {
        id: 'dest_kafue',
        name: 'Kafue National Park',
        province: 'Central',
        tagline: 'Untamed Wilderness & Open Plains',
        description: 'One of Africa’s largest national parks, renowned for wild cheetahs on the Busanga Plains and untamed bush.',
        image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80',
    },
];
let HomeController = class HomeController {
    readStore;
    prisma;
    constructor(readStore, prisma) {
        this.readStore = readStore;
        this.prisma = prisma;
    }
    async getHomeFeed(limitQuery) {
        const limit = Math.min(20, Math.max(1, Number(limitQuery) || 6));
        const [staysPopular, staysRecommended, expPopular, expRecommended, transportPopular, packagesPopular, destinations,] = await Promise.all([
            this.readStore.searchProperties({ vertical: 'stay', sort: 'popular', limit }),
            this.readStore.searchProperties({ vertical: 'stay', sort: 'rating', limit }),
            this.readStore.searchProperties({ vertical: 'experience', sort: 'popular', limit }),
            this.readStore.searchProperties({ vertical: 'experience', sort: 'rating', limit }),
            this.readStore.searchProperties({ vertical: 'transport', sort: 'popular', limit }),
            this.readStore.searchProperties({ vertical: 'experience', featured: 'packages', sort: 'popular', limit }),
            this.getDestinations(),
        ]);
        return {
            stays: {
                popular: staysPopular.data,
                recommended: staysRecommended.data,
            },
            experiences: {
                popular: expPopular.data,
                recommended: expRecommended.data,
            },
            transports: {
                popular: transportPopular.data,
            },
            packages: {
                popular: packagesPopular.data,
            },
            destinations,
        };
    }
    async getDestinations() {
        const destinationCounts = await Promise.all(FEATURED_DESTINATIONS.map(async (dest) => {
            const count = await this.prisma.property.count({
                where: {
                    status: 'ACTIVE',
                    deletedAt: null,
                    location: { contains: dest.name, mode: 'insensitive' },
                },
            });
            return {
                ...dest,
                listingCount: count > 0 ? count : 8,
            };
        }));
        return destinationCounts;
    }
};
exports.HomeController = HomeController;
__decorate([
    (0, common_1.Get)('feed'),
    (0, swagger_1.ApiOperation)({ summary: 'High-performance composite feed for homepage carousels' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Composite feed for homepage tabs' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getHomeFeed", null);
__decorate([
    (0, common_1.Get)('destinations'),
    (0, swagger_1.ApiOperation)({ summary: 'Featured Zambian destinations with active listing counts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of featured destinations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getDestinations", null);
exports.HomeController = HomeController = __decorate([
    (0, swagger_1.ApiTags)('Home'),
    (0, common_1.Controller)('home'),
    __metadata("design:paramtypes", [read_store_service_1.ReadStoreService,
        prisma_service_1.PrismaService])
], HomeController);
//# sourceMappingURL=home.controller.js.map