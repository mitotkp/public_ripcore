import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from './auth/config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { RbacModule } from './rbac/rbac.module';
import { AuditModule } from './audit/audit.module';
import { EncryptionHelper } from './auth/helpers/encryption.helper';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
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
          autoLoadEntities: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    MailModule,
    RbacModule,
    SettingsModule,
    MailModule,
    AuditModule,
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class AppModule {}
