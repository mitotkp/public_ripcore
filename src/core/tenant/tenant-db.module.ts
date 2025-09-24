import { Module, Global } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantConnectionManager } from './tenant-connection.manager';
import { EncryptionHelper } from '../auth/helpers/encryption.helper';

@Global() // Hace que los providers de este módulo estén disponibles en toda la app
@Module({
  providers: [TenantService, TenantConnectionManager, EncryptionHelper],
  exports: [TenantService, TenantConnectionManager, EncryptionHelper],
})
export class TenantDbModule {}
