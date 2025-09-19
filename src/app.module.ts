import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { RbacModule } from './core/rbac/rbac.module';
import { SettingsModule } from './core/settings/settings.module';
import { AuditModule } from './core/audit/audit.module';
import { TenantDbModule } from './core/tenant/tenant-db.module';
import { TenantMiddleware } from './core/tenant/tenant.middleware';
import { ProfilesModule } from './modules/profiles/profile.module';
import { configuration } from './config/configuration';
import { EncryptionHelper } from './core/auth/helpers/encryption.helper';

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
        const encryptionHelper = new EncryptionHelper();

        const decryptedPassword = encryptionHelper.desEncriptar(
          coreDbConfig.password,
        );

        return {
          ...coreDbConfig,
          password: decryptedPassword,
        };
      },
    }),
    //Módulos del Core de la aplicación
    UsersModule,
    AuthModule,
    RbacModule,
    SettingsModule,
    AuditModule,
    TenantDbModule,
    AuditModule,
    //Módulos de Lógica de Negocio (Features)
    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude('/auth/login', '/health')
      .forRoutes('*');
  }
}
