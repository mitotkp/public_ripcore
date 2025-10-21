import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Tenant } from './tenant.interface';
import { CreateTenantDto } from './dto/create-tenant.dto';
//import { EncryptionHelper } from '../auth/helpers/encryption.helper';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { VerifyTenantDto } from './dto/verfiy-tenant.dto';
import { createConnection, Connection } from 'typeorm';

@Injectable()
export class TenantService {
  private readonly configPath = path.join(process.cwd(), 'config.json');

  constructor(
    private readonly configService: ConfigService,
    //private readonly encryptionHelper: EncryptionHelper,
    //private readonly connectionManager: TenantConnectionManager,
  ) {}

  findByName(name: string): Tenant {
    const tenants = this.configService.get<Tenant[]>('tenants');

    if (!tenants || tenants.length === 0) {
      throw new Error('No tenants are configured in config file.');
    }

    const tenant = tenants.find(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );

    if (!tenant) {
      throw new NotFoundException(`Tenant with name '${name}' not found.`);
    }

    return tenant;
  }

  findAll(): Omit<Tenant, 'password'>[] {
    const tenants = this.configService.get<Tenant[]>('tenants');

    if (!tenants || tenants.length === 0) {
      return [];
    }

    return tenants.map(({ password, ...tenant }) => tenant);
  }

  async create(CreateTenantDto: CreateTenantDto): Promise<Tenant> {
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));

    const tenants = config.tenants || [];

    const existingTenant = tenants.find(
      (t) => t.name.toLowerCase() === CreateTenantDto.name.toLowerCase(),
    );
    if (existingTenant) {
      throw new ConflictException(
        `El tenant con el nombre '${CreateTenantDto.name}' ya existe`,
      );
    }

    const newTenant = {
      ...CreateTenantDto,
      //password: this.encryptionHelper.encriptar(CreateTenantDto.password),
    };

    config.tenants.push(newTenant);

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');

    console.warn(
      'ADVERTENCIA:  Se ha añadido un nuevo tenant. Puede ser necesario reiniciar la aplicación para que todos los servicios reconozcan la nueva configuración.',
    );

    return newTenant;
  }

  async update(
    name: string,
    UpdateTenantDto: UpdateTenantDto,
  ): Promise<Omit<Tenant, 'password'>> {
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
    const tenants: Tenant[] = config.tenants || [];

    const tenantIndex = tenants.findIndex(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );

    if (tenantIndex === -1) {
      throw new NotFoundException(
        `El tenant con el nombre ${name} no fue encontrado`,
      );
    }

    // if (UpdateTenantDto.password) {
    //   UpdateTenantDto.password = this.encryptionHelper.encriptar(
    //     UpdateTenantDto.password,
    //   );
    // }

    const updatedTenant = { ...tenants[tenantIndex], ...UpdateTenantDto };
    config.tenants[tenantIndex] = updatedTenant;

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');

    console.warn(
      `ADVERTENCIA: Se ha actualizado el tenant '${name}'. Puede ser necesario reiniciar la aplicación.`,
    );

    const { password, ...result } = updatedTenant;
    return result;
  }

  async remove(name: string): Promise<void> {
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
    const tenants: Tenant[] = config.tenants || [];

    const initialLength = tenants.length;
    const filteredTenants = tenants.filter(
      (t) => t.name.toLowerCase() !== name.toLowerCase(),
    );

    if (filteredTenants.length === initialLength) {
      throw new NotFoundException(
        `El tenant con el nombre '${name}' no fue encontrado.`,
      );
    }

    config.tenants = filteredTenants;

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');

    console.warn(
      `ADVERTENCIA: Se ha eliminado el tenant '${name}'. Puede ser necesario reiniciar la aplicación.`,
    );
  }

  async verifyConnection(
    verifyTenantDto: VerifyTenantDto,
  ): Promise<{ status: string; message: string }> {
    const tempConnectionName = `verify-${verifyTenantDto.name}-${Date.now()}`;
    let connection: Connection | undefined;

    try {
      connection = await createConnection({
        name: tempConnectionName,
        type: verifyTenantDto.type,
        host: verifyTenantDto.server,
        port: verifyTenantDto.port,
        username: verifyTenantDto.user,
        password: verifyTenantDto.password,
        database: verifyTenantDto.database,
        options: verifyTenantDto.options,
        entities: [],
        synchronize: false,
      });

      return { status: 'ok', message: 'Conexión exitosa.' };
    } catch (error) {
      console.error('Error de conexión al verificar tenant:', error.message);
      throw new BadGatewayException(`Error de conexión: ${error.message}`);
    } finally {
      if (connection && connection.isConnected) {
        await connection.close();
      }
    }
  }
}
