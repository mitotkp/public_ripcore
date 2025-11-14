import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async onModuleInit() {
    this.logger.log('Verificando configuraciones iniciales...');

    // Define tus configuraciones por defecto aquí
    const defaultSettings = [
      { key: 'app_name', value: 'RedesIP Core' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'allow_registration', value: 'true' },
    ];

    for (const setting of defaultSettings) {
      await this.findOrCreate(setting.key, setting.value);
    }
  }

  private async findOrCreate(key: string, value: string) {
    try {
      // Intenta encontrarla
      await this.findOne(key);
    } catch (error) {
      // Si da NotFound, la crea
      if (error instanceof NotFoundException) {
        this.logger.log(`Creando configuración por defecto: ${key}`);
        await this.create({ key, value });
      } else {
        throw error;
      }
    }
  }

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
