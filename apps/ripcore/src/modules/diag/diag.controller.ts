import { Controller, Get, Headers } from '@nestjs/common';

@Controller('diag')
export class DiagController {
  @Get('testApi')
  testApi(@Headers() headers: Record<string, string>) {
    const identity = {
      userId: headers['x-user-id'],
      userName: headers['x-user-name'],
      roles: headers['x-user-roles']?.split(','),
      tenant: headers['x-tenant-id'],
      dbName: headers['x-dbname-id'],
    };

    if (!identity.userId) {
      return {
        status: 'error',
        message: 'No se recibió identidad del Gateway.',
        received_headers: headers,
      };
    }

    return {
      status: 'ok',
      message: 'Respuesta exitosa desde el Core',
      identity_recived: identity,
    };
  }

  @Get('ping')
  ping() {
    return {
      status: 'ok',
      message: 'Servicio RipCore está respondiendo.',
      timestamp: new Date().toISOString(),
    };
  }
}
