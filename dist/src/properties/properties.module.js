"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesModule = void 0;
const common_1 = require("@nestjs/common");
const properties_service_1 = require("./properties.service");
const properties_controller_1 = require("./properties.controller");
const listings_controller_1 = require("./listings.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const read_store_module_1 = require("../read-store/read-store.module");
const hosts_module_1 = require("../hosts/hosts.module");
const popularity_module_1 = require("../popularity/popularity.module");
let PropertiesModule = class PropertiesModule {
};
exports.PropertiesModule = PropertiesModule;
exports.PropertiesModule = PropertiesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, read_store_module_1.ReadStoreModule, hosts_module_1.HostsModule, popularity_module_1.PopularityModule],
        controllers: [properties_controller_1.PropertiesController, listings_controller_1.ListingsController],
        providers: [properties_service_1.PropertiesService],
        exports: [properties_service_1.PropertiesService],
    })
], PropertiesModule);
//# sourceMappingURL=properties.module.js.map