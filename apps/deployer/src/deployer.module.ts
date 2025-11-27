import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DeployerController } from './deployer.controller';
import { DeployerService } from './deployer.service';

@Module({
  imports: [HttpModule],
  controllers: [DeployerController],
  providers: [DeployerService],
})
export class DeployerModule {}
