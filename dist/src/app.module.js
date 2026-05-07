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
const accommodations_module_1 = require("./accommodations/accommodations.module");
const buses_module_1 = require("./buses/buses.module");
const attractions_module_1 = require("./attractions/attractions.module");
const packages_module_1 = require("./packages/packages.module");
const bookings_module_1 = require("./bookings/bookings.module");
const payments_module_1 = require("./payments/payments.module");
const notifications_module_1 = require("./notifications/notifications.module");
const recommendations_module_1 = require("./recommendations/recommendations.module");
const uploads_module_1 = require("./uploads/uploads.module");
const admin_module_1 = require("./admin/admin.module");
const popular_module_1 = require("./popular/popular.module");
const api_module_1 = require("./api/api.module");
const stays_module_1 = require("./stays/stays.module");
const collections_module_1 = require("./collections/collections.module");
const feedback_module_1 = require("./feedback/feedback.module");
const inbox_module_1 = require("./inbox/inbox.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            hosts_module_1.HostsModule,
            accommodations_module_1.AccommodationsModule,
            buses_module_1.BusesModule,
            attractions_module_1.AttractionsModule,
            packages_module_1.PackagesModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            notifications_module_1.NotificationsModule,
            recommendations_module_1.RecommendationsModule,
            uploads_module_1.UploadsModule,
            admin_module_1.AdminModule,
            popular_module_1.PopularModule,
            api_module_1.ApiModule,
            stays_module_1.StaysModule,
            collections_module_1.CollectionsModule,
            feedback_module_1.FeedbackModule,
            inbox_module_1.InboxModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map