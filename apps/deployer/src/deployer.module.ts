import { Module } from '@nestjs/common';
import { DeployerController } from './deployer.controller';
import { DeployerService } from './deployer.service';

@Module({
  imports: [],
  controllers: [DeployerController],
  providers: [DeployerService],
})
export class DeployerModule {}
