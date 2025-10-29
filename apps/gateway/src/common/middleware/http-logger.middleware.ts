import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestWithMaybeUser extends Request {
  user?: {
    sub?: string | number;
    name?: string;
    tenant?: string;
  };
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(
    request: RequestWithMaybeUser,
    response: Response,
    next: NextFunction,
  ): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const start = Date.now();

    this.logger.log(`--> ${method} ${originalUrl} - ${userAgent} ${ip}`);

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - start;

      let logLevel: 'log' | 'warn' | 'error' = 'log';
      if (statusCode >= 500) {
        logLevel = 'error';
      } else if (statusCode >= 400) {
        logLevel = 'warn';
      }

      const userId = request.user?.sub ? ` UserID:${request.user.sub}` : '';
      const tenantId = request.user?.tenant
        ? ` Tenant:${request.user.tenant}`
        : '';

      this.logger[logLevel](
        `<-- ${method} ${originalUrl} ${statusCode} ${contentLength || '-'} - ${duration}ms ${userAgent} ${ip}${userId}${tenantId}`,
      );
    });

    next();
  }
}
