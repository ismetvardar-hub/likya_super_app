import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  // Güvenlik başlıkları
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });

  // API Gateway öneki: /v1/{modül}
  app.setGlobalPrefix('v1');

  // DTO doğrulama (strict): whitelist + transform
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  Logger.log(`Likya Backend API ready → http://localhost:${port}/v1`, 'Bootstrap');
}

void bootstrap();
