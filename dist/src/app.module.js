"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const hosts_module_1 = require("./hosts/hosts.module");
const properties_module_1 = require("./properties/properties.module");
const bookings_module_1 = require("./bookings/bookings.module");
const payments_module_1 = require("./payments/payments.module");
const reviews_module_1 = require("./reviews/reviews.module");
const notifications_module_1 = require("./notifications/notifications.module");
const wishlist_module_1 = require("./wishlist/wishlist.module");
const availability_module_1 = require("./availability/availability.module");
const uploads_module_1 = require("./uploads/uploads.module");
const admin_module_1 = require("./admin/admin.module");
const platform_module_1 = require("./platform/platform.module");
const read_store_module_1 = require("./read-store/read-store.module");
const schedule_1 = require("@nestjs/schedule");
const policies_module_1 = require("./policies/policies.module");
const popularity_module_1 = require("./popularity/popularity.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 600 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            hosts_module_1.HostsModule,
            properties_module_1.PropertiesModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            reviews_module_1.ReviewsModule,
            notifications_module_1.NotificationsModule,
            wishlist_module_1.WishlistModule,
            availability_module_1.AvailabilityModule,
            uploads_module_1.UploadsModule,
            admin_module_1.AdminModule,
            platform_module_1.PlatformModule,
            read_store_module_1.ReadStoreModule,
            policies_module_1.PoliciesModule,
            popularity_module_1.PopularityModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map