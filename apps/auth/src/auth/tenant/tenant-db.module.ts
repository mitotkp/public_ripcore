import { Module, Global } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { ConfigModule } from '@nestjs/config';
import { TenantConnectionManager } from './tenant-connection.manager';
import { EncryptionHelper } from '../helpers/encryption.helper';
//import { EncryptionHelper } from '../auth/helpers/encryption.helper';
import { TenantController } from './tenant.controller';

@Global() // Hace que los providers de este módulo estén disponibles en toda la app
@Module({
  imports: [ConfigModule],
  providers: [TenantService, TenantConnectionManager, EncryptionHelper],
  exports: [TenantService, TenantConnectionManager, EncryptionHelper],
  controllers: [TenantController],
})
export class TenantDbModule {}
