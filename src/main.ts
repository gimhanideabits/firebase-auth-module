import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { SwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parsing
  app.use(cookieParser());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: false,
  }));

  // Swagger configuration
  const config = SwaggerConfig.createDocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, config, SwaggerConfig.getSwaggerOptions());
  
  SwaggerModule.setup('api', app, document, SwaggerConfig.getSwaggerUIOptions());
  
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 5002}`);
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT ?? 5002}/api`);
  
  await app.listen(process.env.PORT ?? 5002);
}
bootstrap();
