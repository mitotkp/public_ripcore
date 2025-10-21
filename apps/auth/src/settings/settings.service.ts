import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async create(CreateSettingDto: CreateSettingDto): Promise<Setting> {
    const setting = this.settingsRepository.create(CreateSettingDto);

    return this.settingsRepository.save(setting);
  }

  findAll(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }

  async findOne(key: string): Promise<Setting> {
    const setting = await this.settingsRepository.findOneBy({ key });
    if (!setting) {
      throw new NotFoundException(
        `Configuración con clave "${key}" no encontrada.`,
      );
    }
    return setting;
  }

  async update(key: string, value: string): Promise<Setting> {
    const setting = await this.findOne(key); // Reutilizamos para verificar que exista
    setting.value = value;
    return this.settingsRepository.save(setting);
  }
}
