import { NestFactory } from '@nestjs/core';
import { DeployerModule } from './deployer.module';

async function bootstrap() {
  const app = await NestFactory.create(DeployerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
