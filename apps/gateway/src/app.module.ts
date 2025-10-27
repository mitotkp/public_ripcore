import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
        }),
      )
      .forRoutes('api/rbac');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
        }),
      )
      .forRoutes('/api/tenants');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
        }),
      )
      .forRoutes('api/settings');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
        }),
      )
      .forRoutes('api/audit-logs');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
        }),
      )
      .forRoutes('api/auth');

    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:7575',
          changeOrigin: true,
        }),
      )
      .forRoutes('api');
  }
}
