"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadStoreModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const read_store_service_1 = require("./read-store.service");
const property_sync_worker_1 = require("./property-sync.worker");
const property_sync_interceptor_1 = require("./property-sync.interceptor");
const prisma_module_1 = require("../prisma/prisma.module");
const property_sync_constants_1 = require("./property-sync.constants");
let ReadStoreModule = class ReadStoreModule {
};
exports.ReadStoreModule = ReadStoreModule;
exports.ReadStoreModule = ReadStoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('REDIS_HOST') || 'localhost',
                        port: config.get('REDIS_PORT') || 6379,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.registerQueue({ name: property_sync_constants_1.PROPERTY_SYNC_QUEUE }),
        ],
        providers: [
            read_store_service_1.ReadStoreService,
            property_sync_worker_1.PropertySyncWorker,
            property_sync_interceptor_1.PropertySyncInterceptor,
        ],
        exports: [read_store_service_1.ReadStoreService, property_sync_interceptor_1.PropertySyncInterceptor, bullmq_1.BullModule],
    })
], ReadStoreModule);
//# sourceMappingURL=read-store.module.js.map