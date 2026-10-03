import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Lightweight DB health check — exposes real error in production for diagnostics
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/health', async (_req: any, res: any) => {
    try {
      const prisma = app.get(PrismaService);
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (e: any) {
      res.status(503).json({ status: 'error', db: 'disconnected', message: e?.message });
    }
  });


  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Nearby Escapes API')
      .setDescription('Backend API for the Nearby Escapes booking platform')
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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
