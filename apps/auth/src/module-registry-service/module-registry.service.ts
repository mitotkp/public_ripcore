import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistredModule } from './entities/ModuleEntity';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleRegistryService {
  constructor(
    @InjectRepository(RegistredModule, 'default')
    private readonly moduleRepository: Repository<RegistredModule>,
  ) {}

  create(createModuleDto: CreateModuleDto): Promise<RegistredModule> {
    const newModule = this.moduleRepository.create(createModuleDto);
    return this.moduleRepository.save(newModule);
  }

  findAll(): Promise<RegistredModule[]> {
    return this.moduleRepository.find();
  }

  findAllEnabled(): Promise<RegistredModule[]> {
    return this.moduleRepository.findBy({ isEnabled: 1 });
  }

  async findOne(id: number): Promise<RegistredModule> {
    const module = await this.moduleRepository.findOneBy({ id });
    if (!module) {
      throw new NotFoundException(`Módulo con ID "${id}" no encontrado.`);
    }
    return module;
  }

  async update(
    id: number,
    updateModuleDto: UpdateModuleDto,
  ): Promise<RegistredModule> {
    const module = await this.moduleRepository.preload({
      id: id,
      ...updateModuleDto,
    });
    if (!module) {
      throw new NotFoundException(`Módulo con ID "${id}" no encontrado.`);
    }
    return this.moduleRepository.save(module);
  }

  async remove(id: number): Promise<void> {
    const result = await this.moduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Módulo con ID "${id}" no encontrado.`);
    }
  }
}
