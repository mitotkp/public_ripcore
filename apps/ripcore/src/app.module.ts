import { MiddlewareConsumer, Module, NestModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantDbModule } from './core/tenant/tenant-db.module';
//import { TenantMiddleware } from './core/tenant/tenant.middleware';
import { ProfilesModule } from './modules/profiles/profile.module';
import { configuration } from './config/configuration';
import { EncryptionHelper } from './helpers/encryption.helper';
import { DiagModule } from './modules/diag/diag.module';
//import { ProfilesController } from './modules/profiles/profile.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 7070,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GlobalClientsModule {}

@Module({
  imports: [
    //Módulo de Configuración Global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TenantDbModule,
    //Conexión a la Base de Datos Principal (Core) de forma asíncrona
    TypeOrmModule.forRootAsync({
      name: 'default',
      imports: [ConfigModule, TenantDbModule],
      inject: [ConfigService, EncryptionHelper],
      useFactory: (
        configService: ConfigService,
        encryptionHelper: EncryptionHelper,
      ) => {
        const coreDbConfig = configService.get('coreDatabase');

        const decryptedPassword = encryptionHelper.desEncriptar(
          coreDbConfig.password,
        );

        return {
          ...coreDbConfig,
          password: decryptedPassword,
          autoLoadEntities: true,
        };
      },
    }),
    //Módulos del Core de la aplicación
    GlobalClientsModule,
    ProfilesModule,
    DiagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    console.log(consumer);
    //consumer.apply(TenantMiddleware).forRoutes(ProfilesController);
  }
}
