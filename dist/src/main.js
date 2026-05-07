"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
        credentials: true,
    });
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Nearby Escapes API')
            .setDescription('Backend API for the Nearby Escapes online booking platform')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
            .addTag('Auth', 'Authentication & registration')
            .addTag('Users', 'User profile management')
            .addTag('Hosts', 'Host profile & approval')
            .addTag('Accommodations', 'Accommodation listings')
            .addTag('Buses', 'Bus listings')
            .addTag('Attractions', 'Attraction listings')
            .addTag('Packages', 'Bundled packages')
            .addTag('Bookings', 'Booking management')
            .addTag('Payments', 'Payment processing')
            .addTag('Recommendations', 'Personalized recommendations')
            .addTag('Popular', 'Popular products for home page')
            .addTag('Uploads', 'Photo uploads')
            .addTag('Admin', 'Admin dashboard & analytics')
            .addTag('Stays', 'Unified stay listings')
            .addTag('Collections', 'Wishlists / saved stays')
            .addTag('Feedback', 'Reviews and ratings')
            .addTag('Inbox', 'Messaging between users and hosts')
            .addTag('Host', 'Host dashboard, earnings, calendar, listings')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
    }
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map