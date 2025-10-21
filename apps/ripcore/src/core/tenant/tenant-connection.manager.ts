import { Injectable, Scope } from '@nestjs/common';
import { createConnection, Connection, getConnectionManager } from 'typeorm';
import { Tenant } from './tenant.interface';

@Injectable({ scope: Scope.REQUEST })
export class TenantConnectionManager {
  constructor() {}

  async getConnection(tenant: Tenant, dbName?: string): Promise<Connection> {
    const connectionManager = getConnectionManager();
    const targetDatabase = dbName || tenant.database;
    const connectionName = `tenant_${tenant.name}_${targetDatabase}`;

    if (connectionManager.has(connectionName)) {
      const connection = connectionManager.get(connectionName);
      return connection.isConnected ? connection : await connection.connect();
    }

    return await createConnection({
      name: connectionName,
      type: tenant.type,
      host: tenant.server,
      port: tenant.port,
      username: tenant.user,
      password: tenant.password,
      database: targetDatabase,
      // Ajusta la ruta de entidades para que funcione desde la nueva ubicación
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      synchronize: false,
      options: tenant.options,
    });
  }
}
