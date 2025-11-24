import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import process from 'node:process';

import { json } from 'express';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

import { AppModule } from '@src/app/app.module';
import { swaggerConfig } from '@src/common/utils/swagger-config';

import { AppEnvironment } from '../config/app-environment';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.set('trust proxy', 1);
  app.use(helmet());
  app.useLogger(app.get(Logger));
  app.use(json({ limit: '500kb' }));

  swaggerConfig(app);

  if (process.env.NODE_ENV === AppEnvironment.Production && !process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN is required');
  }

  app.enableCors({
    origin:
      process.env.NODE_ENV === AppEnvironment.Production
        ? process.env.CORS_ORIGIN?.split(',')
        : ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    maxAge: 3600,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line
bootstrap();
