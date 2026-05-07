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
exports.StaysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stays_service_1 = require("./stays.service");
let StaysController = class StaysController {
    staysService;
    constructor(staysService) {
        this.staysService = staysService;
    }
    findAll(q, location, minPrice, maxPrice) {
        return this.staysService.findAll(q, location, minPrice ? +minPrice : undefined, maxPrice ? +maxPrice : undefined);
    }
    findOne(id) {
        return this.staysService.findOne(id);
    }
};
exports.StaysController = StaysController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List stays with optional search/filter' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'location', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false, type: Number }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('location')),
    __param(2, (0, common_1.Query)('minPrice')),
    __param(3, (0, common_1.Query)('maxPrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], StaysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single stay by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StaysController.prototype, "findOne", null);
exports.StaysController = StaysController = __decorate([
    (0, swagger_1.ApiTags)('Stays'),
    (0, common_1.Controller)('stays'),
    __metadata("design:paramtypes", [stays_service_1.StaysService])
], StaysController);
//# sourceMappingURL=stays.controller.js.map