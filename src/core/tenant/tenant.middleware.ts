import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantName = req.headers['x-tenant-id'] as string;

    if (!tenantName) {
      throw new BadRequestException('X-Tenant-ID header is missing.');
    }

    const tenant = await this.tenantService.findByName(tenantName);

    (req as any).tenant = tenant;
    next();
  }
}
