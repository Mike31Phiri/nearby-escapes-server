"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopularModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const popular_service_1 = require("./popular.service");
const popular_controller_1 = require("./popular.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let PopularModule = class PopularModule {
};
exports.PopularModule = PopularModule;
exports.PopularModule = PopularModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        controllers: [popular_controller_1.PopularController],
        providers: [popular_service_1.PopularService],
    })
], PopularModule);
//# sourceMappingURL=popular.module.js.map