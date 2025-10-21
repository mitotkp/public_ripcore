import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

//import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
//import { JwtStrategy } from './strategies/jwt.strategy';
import { TenantDbModule } from './tenant/tenant-db.module';
//import { EncryptionHelper } from './helpers/encryption.helper';

import { JwtStrategy } from './strategies/jwt.strategy';
import { SelectionTokenStrategy } from './strategies/selection-token.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocklistService } from './blocklist.service';
import { BlocklistedToken } from './entities/blocklisted-token.entity';

@Module({
  imports: [
    //UsersModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
    TenantDbModule,
    TypeOrmModule.forFeature([BlocklistedToken], 'default'),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    //EncryptionHelper,
    JwtStrategy,
    SelectionTokenStrategy,
    BlocklistService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
