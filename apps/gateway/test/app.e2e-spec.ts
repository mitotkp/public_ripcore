import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GatewayModule } from '../src/gateway.module'; // Ajusta la ruta si es necesario

describe('AuthGatewayController (e2e) - Admin Routes', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería retornar 401 si no se envía el header Authorization', () => {
    return request(app.getHttpServer())
      .get('/api/rbac/roles') // Usa una ruta protegida
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toEqual(
          'Authorization header is missing or invalid',
        );
      });
  });

  it('debería retornar 401 si el token es inválido', () => {
    return request(app.getHttpServer())
      .get('/api/rbac/roles')
      .set('Authorization', 'Bearer tokeninvalido')
      .expect(401);
    // Puedes añadir más aserciones sobre el cuerpo de la respuesta si lo deseas
  });

  // Añade más pruebas aquí, por ejemplo, una prueba con un token válido
  // para asegurar que el acceso funciona cuando debe.
  // Necesitarás obtener un token válido primero, similar a como
  // se hace en apps/ripcore/test/auth.e2e-spec.ts
});
