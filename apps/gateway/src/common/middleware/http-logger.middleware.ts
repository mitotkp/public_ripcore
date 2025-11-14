import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClientProxy } from '@nestjs/microservices';

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

  constructor(
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientProxy,
  ) {}

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
      // const auditUserId = request.user?.sub ? request.user.sub : null;
      // const auditTenant = request.user?.tenant || null;
      // const auditDbName = (request.user as any)?.dbName || null;

      // this.auditClient.emit('log_audit', {
      //   userId: auditUserId,
      //   action: `http_${method}`,
      //   targetEntity: 'http_request',
      //   targetId: originalUrl,
      //   details: {
      //     statusCode: statusCode,
      //     durationMs: duration,
      //     ip: ip,
      //     userAgent: userAgent || '',
      //     tenant: auditTenant,
      //     dbName: auditDbName,
      //     logLevel: logLevel,
      //   },
      // });

      this.logger[logLevel](
        `<-- ${method} ${originalUrl} ${statusCode} ${contentLength || '-'} - ${duration}ms ${userAgent} ${ip}${userId}${tenantId}`,
      );
    });

    next();
  }
}
