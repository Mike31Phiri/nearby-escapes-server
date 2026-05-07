"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttractionsModule = void 0;
const common_1 = require("@nestjs/common");
const attractions_service_1 = require("./attractions.service");
const attractions_controller_1 = require("./attractions.controller");
const uploads_module_1 = require("../uploads/uploads.module");
const hosts_service_1 = require("../hosts/hosts.service");
let AttractionsModule = class AttractionsModule {
};
exports.AttractionsModule = AttractionsModule;
exports.AttractionsModule = AttractionsModule = __decorate([
    (0, common_1.Module)({
        imports: [uploads_module_1.UploadsModule],
        providers: [attractions_service_1.AttractionsService, hosts_service_1.HostsService],
        controllers: [attractions_controller_1.AttractionsController],
        exports: [attractions_service_1.AttractionsService],
    })
], AttractionsModule);
//# sourceMappingURL=attractions.module.js.map