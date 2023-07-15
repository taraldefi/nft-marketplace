import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from './common/transaction/common';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator';
import validationOptions from './common/validation/validation.options';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { start } from './simple-listener';

async function bootstrap() {
  require('tsconfig-paths/register');

  initializeTransactionalContext(); // Initialize cls-hooked
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });

  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });

  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const port = configService.get('app.port');

  await app.listen(port);
  console.log(`Application listening in port: ${port}`);
}
bootstrap();
// start()