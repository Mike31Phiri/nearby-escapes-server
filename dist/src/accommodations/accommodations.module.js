"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationsModule = void 0;
const common_1 = require("@nestjs/common");
const accommodations_service_1 = require("./accommodations.service");
const accommodations_controller_1 = require("./accommodations.controller");
const uploads_module_1 = require("../uploads/uploads.module");
const hosts_service_1 = require("../hosts/hosts.service");
let AccommodationsModule = class AccommodationsModule {
};
exports.AccommodationsModule = AccommodationsModule;
exports.AccommodationsModule = AccommodationsModule = __decorate([
    (0, common_1.Module)({
        imports: [uploads_module_1.UploadsModule],
        providers: [accommodations_service_1.AccommodationsService, hosts_service_1.HostsService],
        controllers: [accommodations_controller_1.AccommodationsController],
        exports: [accommodations_service_1.AccommodationsService],
    })
], AccommodationsModule);
//# sourceMappingURL=accommodations.module.js.map