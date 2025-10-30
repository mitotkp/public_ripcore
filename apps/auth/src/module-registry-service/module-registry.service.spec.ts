import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRegistryService } from './module-registry.service';

describe('ModuleRegistryService', () => {
  let service: ModuleRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModuleRegistryService],
    }).compile();

    service = module.get<ModuleRegistryService>(ModuleRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
