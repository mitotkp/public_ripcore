import { Controller, Get, Post, Body } from '@nestjs/common';
import { DeployerService } from './deployer.service';
import { DeployModuleDto } from './dto/deploy-module.dto';

@Controller('deployer')
export class DeployerController {
  constructor(private readonly deployerService: DeployerService) {}

  @Get('containers')
  async getContainers() {
    return this.deployerService.listContainers();
  }

  @Post('deploy')
  async deployModule(@Body() deployModuleDto: DeployModuleDto) {
    return this.deployerService.deployModule(deployModuleDto);
  }
}