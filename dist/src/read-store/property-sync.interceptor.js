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
exports.ListingSyncInterceptor = exports.PropertySyncInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const read_store_service_1 = require("./read-store.service");
let PropertySyncInterceptor = class PropertySyncInterceptor {
    readStore;
    constructor(readStore) {
        this.readStore = readStore;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.tap)(async (result) => {
            const req = context.switchToHttp().getRequest();
            const propertyId = result?.propertyId || result?.id || req?.params?.id;
            const deleted = result?.deleted === true;
            if (propertyId) {
                try {
                    await this.readStore.enqueueSync(propertyId, deleted);
                }
                catch {
                }
            }
        }));
    }
};
exports.PropertySyncInterceptor = PropertySyncInterceptor;
exports.PropertySyncInterceptor = PropertySyncInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [read_store_service_1.ReadStoreService])
], PropertySyncInterceptor);
exports.ListingSyncInterceptor = PropertySyncInterceptor;
//# sourceMappingURL=property-sync.interceptor.js.map