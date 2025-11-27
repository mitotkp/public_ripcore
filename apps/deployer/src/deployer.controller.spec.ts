import { Test, TestingModule } from '@nestjs/testing';
import { DeployerController } from './deployer.controller';
import { DeployerService } from './deployer.service';

describe('DeployerController', () => {
  let deployerController: DeployerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DeployerController],
      providers: [DeployerService],
    }).compile();

    deployerController = app.get<DeployerController>(DeployerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(deployerController.getHello()).toBe('Hello World!');
    });
  });
});
