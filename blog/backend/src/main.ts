import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Blog frontend with landing page (dev)
      'http://localhost:3002',  // Blog frontend (dev)
      'http://localhost:3001',  // Moderator interface (old dev)
      'http://localhost:3003',  // Moderator interface (new dev)
      'http://localhost:3004',  // Blog frontend (current dev)
      'https://darslinker-mvhe.vercel.app',  // Blog frontend (prod)
      'https://heartfelt-centaur-5fc321.netlify.app',  // Moderator interface (prod)
      'https://moderator.darslinker.uz',  // Moderator interface (custom domain)
      'https://darslinker.uz',  // Main domain + blog subfolder
      'https://www.darslinker.uz',  // Main domain with www
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 Blog Backend running on http://localhost:${port}/api`);
}

bootstrap();