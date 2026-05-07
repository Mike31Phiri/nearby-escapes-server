import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Nearby Escapes API')
      .setDescription('Backend API for the Nearby Escapes online booking platform')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
