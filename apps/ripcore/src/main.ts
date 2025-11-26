import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Ripcore Service API')
    .setDescription('API de Ripcore')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: 'X-Tenant-ID',
      schema: { example: 'EMPRESA_DEMO' },
      description: 'Identificador del Tenant (Inyectado por el Gateway)',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 7575);
}
bootstrap();
