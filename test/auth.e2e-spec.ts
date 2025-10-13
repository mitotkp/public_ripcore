import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería invalidar un token después del logout', async () => {
    // 1. Inicia sesión para obtener un token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login/core')
      .send({
        email: 'aleloui222@gmail.com', // Reemplaza con un usuario de prueba
        password: 'maximo11032',
      });

    const accessToken = loginResponse.body.accessToken;
    expect(accessToken).toBeDefined();

    // 2. Verifica que el token funciona en una ruta protegida
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // 3. Cierra la sesión
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // 4. Verifica que el token ya NO funciona
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('El token ha sido invalidado.');
  });
});
