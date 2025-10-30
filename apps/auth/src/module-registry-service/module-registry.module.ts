import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistredModule } from './entities/ModuleEntity';
import { ModuleRegistryService } from './module-registry.service';
import { ModuleRegistryController } from './module-registry-controller/module-registry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistredModule], 'default')],
  controllers: [ModuleRegistryController],
  providers: [ModuleRegistryService],
  exports: [ModuleRegistryService],
})
export class ModuleRegistryModule {}
