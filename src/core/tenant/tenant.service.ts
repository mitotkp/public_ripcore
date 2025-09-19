import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Tenant } from './tenant.interface';

@Injectable()
export class TenantService {
  constructor(private readonly configService: ConfigService) {}

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
}
