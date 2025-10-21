import { ConfigModule } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantConnectionManager } from './tenant-connection.manager';
import { EncryptionHelper } from '../../helpers/encryption.helper';
import { TenantController } from './tenant.controller';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TenantService, TenantConnectionManager, EncryptionHelper],

  exports: [TenantService, TenantConnectionManager, EncryptionHelper],
  controllers: [TenantController],
})
export class TenantDbModule {}
