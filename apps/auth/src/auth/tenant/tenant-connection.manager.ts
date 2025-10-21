import { Injectable, Scope } from '@nestjs/common';
import { createConnection, Connection, getConnectionManager } from 'typeorm';
import { Tenant } from './tenant.interface'; // Asegúrate que la ruta sea correcta
//import { EncryptionHelper } from '../auth/helpers/encryption.helper';
import { EncryptionHelper } from '../helpers/encryption.helper';

@Injectable({ scope: Scope.REQUEST })
export class TenantConnectionManager {
  constructor(private readonly encryptionHelper: EncryptionHelper) {}

  async getConnection(tenant: Tenant, dbName?: string): Promise<Connection> {
    const connectionManager = getConnectionManager();
    const connectionName = `tenant_${tenant.name}_${dbName || tenant.database}`;

    if (connectionManager.has(connectionName)) {
      const connection = connectionManager.get(connectionName);
      return connection.isConnected ? connection : await connection.connect();
    }

    const decryptedPassword = this.encryptionHelper.desEncriptar(
      tenant.password,
    );

    return await createConnection({
      name: connectionName,
      type: tenant.type,
      host: tenant.server,
      port: tenant.port,
      username: tenant.user,
      password: decryptedPassword,
      database: tenant.database,
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      synchronize: false,
      options: tenant.options,
    });
  }
}
