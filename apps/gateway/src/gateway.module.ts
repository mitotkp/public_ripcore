import { MiddlewareConsumer, Module, NestModule, Logger } from '@nestjs/common';
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

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { APP_GUARD, APP_FILTER, HttpAdapterHost } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
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
  providers: [
    GatewayService,
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useFactory: (HttpAdapterHost: HttpAdapterHost, logger: Logger) => {
        return new HttpExceptionFilter(HttpAdapterHost, logger);
      },
      inject: [HttpAdapterHost, Logger],
    },
  ],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
