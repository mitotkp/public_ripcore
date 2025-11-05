import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.use(helmet());
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.port ?? 3011);
}
bootstrap();
