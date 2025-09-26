import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSettingDto } from './dto/create-setting.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
@Roles('Admin', 'SuperAdmin', 'Soporte') // Solo los Admins pueden acceder
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Post()
  create(@Body() CreateSettingDto: CreateSettingDto) {
    return this.settingsService.create(CreateSettingDto);
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.update(key, value);
  }
}
