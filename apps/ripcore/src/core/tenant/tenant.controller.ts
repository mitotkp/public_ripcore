import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
  Body,
  //UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
//import { RolesGuard } from '../auth/guards/roles.guard';
//import { Roles } from '../auth/decorators/roles.decorator';
//import { brotliDecompress } from 'zlib';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { VerifyTenantDto } from './dto/verfiy-tenant.dto';
//import { Public } from './decorators/public.decorator';

@Controller('tenants')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  //@Roles('SuperAdmin', 'Admin', 'Soporte')
  findAll() {
    return this.tenantService.findAll();
  }

  @Post()
  //@Roles('SuperAdmin', 'Admin', 'Soporte')
  async create(@Body() CreateTenantDto: CreateTenantDto) {
    return this.tenantService.create(CreateTenantDto);
  }

  @Patch(':name')
  //@Roles('SuperAdmin', 'Admin', 'Soporte')
  async update(
    @Param('name') name: string,
    @Body() UpdateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(name, UpdateTenantDto);
  }

  @Delete(':name')
  //@Roles('SuperAdmin', 'Admin', 'Soporte')
  @HttpCode(204)
  async remove(@Param('name') name: string) {
    return this.tenantService.remove(name);
  }

  @Post('verify-connection')
  //@Roles('SuperAdmin', 'Admin', 'Soporte')
  async verifyConnection(@Body() verifyTenantDto: VerifyTenantDto) {
    return this.tenantService.verifyConnection(verifyTenantDto);
  }
}
