import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TenantDbModule } from './core/tenant/tenant-db.module';
import { TenantMiddleware } from './core/tenant/tenant.middleware';
import { ProfilesModule } from './modules/profiles/profile.module';
import { configuration } from './config/configuration';
//import { EncryptionHelper } from './core/auth/helpers/encryption.helper';
import { ProfilesController } from './modules/profiles/profile.controller';

@Module({
  imports: [
    //Módulo de Configuración Global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    //Conexión a la Base de Datos Principal (Core) de forma asíncrona
    TypeOrmModule.forRootAsync({
      name: 'default',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const coreDbConfig = configService.get('coreDatabase');
        //const encryptionHelper = new EncryptionHelper();

        // const decryptedPassword = encryptionHelper.desEncriptar(
        //   coreDbConfig.password,
        // );

        return {
          ...coreDbConfig,
          //password: decryptedPassword,
          autoLoadEntities: true,
        };
      },
    }),
    //Módulos del Core de la aplicación
    TenantDbModule,
    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(ProfilesController);
  }
}
