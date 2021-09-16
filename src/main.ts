import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './components/app/app.module';
import * as cookieParser from 'cookie-parser'
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './components/filter/exceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '../src/public', 'views'));
  app.setViewEngine('hbs');
 
  app.enableCors();
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000);
  console.log('Server started on port 3000');
  Logger.log('User microservice running');
  
}
bootstrap();
