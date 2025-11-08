import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('AgentFoundry API')
    .setDescription('The GitHub + App Store for AI Agents')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter Supabase JWT token',
      },
      'JWT'
    )
    .addTag('skills', 'Skill marketplace operations')
    .addTag('auth', 'Authentication operations')
    .addTag('users', 'User profile operations')
    .addTag('validation', 'Skill validation operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 AgentFoundry API running on http://localhost:${port}`);
  console.log(`📊 Swagger docs available at http://localhost:${port}/api/docs`);
  console.log(`🔥 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
