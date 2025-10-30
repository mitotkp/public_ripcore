import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRegistryController } from './module-registry.controller';

describe('ModuleRegistryController', () => {
  let controller: ModuleRegistryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuleRegistryController],
    }).compile();

    controller = module.get<ModuleRegistryController>(ModuleRegistryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
