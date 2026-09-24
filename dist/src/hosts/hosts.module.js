"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostsModule = void 0;
const common_1 = require("@nestjs/common");
const hosts_service_1 = require("./hosts.service");
const hosts_controller_1 = require("./hosts.controller");
const host_controller_1 = require("./host.controller");
const host_dashboard_service_1 = require("./host-dashboard.service");
const properties_service_1 = require("../properties/properties.service");
const bookings_module_1 = require("../bookings/bookings.module");
let HostsModule = class HostsModule {
};
exports.HostsModule = HostsModule;
exports.HostsModule = HostsModule = __decorate([
    (0, common_1.Module)({
        imports: [bookings_module_1.BookingsModule],
        providers: [hosts_service_1.HostsService, host_dashboard_service_1.HostDashboardService, properties_service_1.PropertiesService],
        controllers: [hosts_controller_1.HostsController, host_controller_1.HostController],
        exports: [hosts_service_1.HostsService],
    })
], HostsModule);
//# sourceMappingURL=hosts.module.js.map