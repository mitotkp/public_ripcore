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

  // --- Métodos para Registro Dinámico ---

  /**
   * Registra o actualiza un módulo externo.
   * Si ya existe (por nombre o prefijo), lo actualiza y lo marca como habilitado.
   */
  async register(createModuleDto: CreateModuleDto): Promise<RegistredModule> {
    // Buscar por nombre O prefijo para evitar duplicados
    const existingModule = await this.moduleRepository.findOne({
      where: [
        { name: createModuleDto.name },
        { prefix: createModuleDto.prefix },
      ],
    });

    if (existingModule) {
      // Actualizar existente
      const updated = await this.moduleRepository.preload({
        id: existingModule.id,
        ...createModuleDto,
        isEnabled: 1, // Asegurar que esté habilitado al registrarse
      });
      return this.moduleRepository.save(updated!);
    } else {
      // Crear nuevo
      const newModule = this.moduleRepository.create({
        ...createModuleDto,
        isEnabled: 1,
      });
      return this.moduleRepository.save(newModule);
    }
  }

  /**
   * Desregistra un módulo (lo marca como deshabilitado).
   * No lo borramos para mantener historial, pero el Gateway dejará de enrutarlo.
   */
  async unregister(name: string): Promise<void> {
    const module = await this.moduleRepository.findOneBy({ name });
    if (module) {
      module.isEnabled = 0;
      await this.moduleRepository.save(module);
    }
    // Si no existe, no hacemos nada (idempotente)
  }
}
