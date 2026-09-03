import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);
  const configuredOrigin = config.get<string>('CORS_ORIGIN', '*').trim();
  const allowAnyOrigin = configuredOrigin === '*';

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: allowAnyOrigin ? true : configuredOrigin.split(',').map((origin) => origin.trim()).filter(Boolean),
    credentials: !allowAnyOrigin,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }));
  await app.listen(config.get<number>('PORT', 4000));
}

bootstrap();
