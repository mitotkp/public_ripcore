import { Module, Global } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantConnectionManager } from './tenant-connection.manager';

import { TenantController } from './tenant.controller';

@Global()
@Module({
  providers: [TenantService, TenantConnectionManager],

  exports: [TenantService, TenantConnectionManager],
  controllers: [TenantController],
})
export class TenantDbModule {}
