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
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Dream Stay Builder API')
      .setDescription('Backend API for the Dream Stay Builder booking platform')
      .setVersion('2.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('Auth', 'Authentication & registration')
      .addTag('Users', 'User profile management')
      .addTag('Hosts', 'Host profile & approval')
      .addTag('Listings', 'Unified listings — stays, experiences, transport')
      .addTag('Bookings', 'Booking management')
      .addTag('Payments', 'DPO payment processing')
      .addTag('Reviews', 'Reviews and ratings')
      .addTag('Notifications', 'In-app notifications')
      .addTag('Messages', 'Conversations and messaging')
      .addTag('Wishlist', 'Saved/wishlisted listings')
      .addTag('Availability', 'Date blocking, seasonal pricing')
      .addTag('Uploads', 'Photo uploads')
      .addTag('Admin', 'Admin dashboard & management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
