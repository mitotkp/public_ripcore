import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ModuleRegistryService } from '../module-registry.service';
//import { ModuleRegistryService } from '../module-registry.service';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('modules')
export class ModuleRegistryController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Post()
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('SuperAdmin', 'Admin')
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleRegistryService.create(createModuleDto);
  }

  @Get()
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('SuperAdmin', 'Admin')
  findAll() {
    return this.moduleRegistryService.findAll();
  }

  @Get('enabled')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('SuperAdmin', 'Admin')
  findAllEnabled() {
    return this.moduleRegistryService.findAllEnabled();
  }

  @Get(':id')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('SuperAdmin', 'Admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moduleRegistryService.findOne(id);
  }

  @Patch(':id')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('SuperAdmin', 'Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.moduleRegistryService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moduleRegistryService.remove(id);
  }
}
