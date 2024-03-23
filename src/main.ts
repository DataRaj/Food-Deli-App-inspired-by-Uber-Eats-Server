import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { addPath } from 'graphql/jsutils/Path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();

// old start package.json
// "start": "cross-env NODE_ENV=prod nest start",
// "start:production": "node dist/main",
//"prebuild": "rimraf dist",
