import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
//import { createProxyMiddleware } from 'http-proxy-middleware';

import { AuthGatewayController } from './auth.controller';
import { RipcoreGatewayController } from './ripcore.controller';
import { HttpModule } from '@nestjs/axios';
import { configuration } from './config/configuration';
//import { config } from 'process';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: '24h' },
      }),
      global: true,
    }),
  ],
  controllers: [
    GatewayController,
    AuthGatewayController,
    RipcoreGatewayController,
  ],
  providers: [GatewayService],
})
export class GatewayModule {}
