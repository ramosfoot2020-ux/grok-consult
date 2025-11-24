import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import process from 'node:process';

import basicAuth from 'express-basic-auth';

import { AppEnvironment } from '../../../config/app-environment';

const SWAGGER_PATH = '/docs';

export const swaggerConfig = (app: INestApplication) => {
  // TODO: Add env
  const swaggerPassword = 'SCEwuPJ8sFbz';

  if (process.env.NODE_ENV === AppEnvironment.Production) {
    app.use(
      [SWAGGER_PATH, `${SWAGGER_PATH}-json`],
      basicAuth({
        challenge: true,
        users: {
          QA: swaggerPassword,
        },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Argus API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
};
