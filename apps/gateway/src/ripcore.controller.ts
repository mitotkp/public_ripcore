import {
  Controller,
  Req,
  All,
  //UnauthorizedException,
  BadGatewayException,
  HttpException,
  HttpStatus,
  NotFoundException,
  Logger,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError, RawAxiosRequestHeaders } from 'axios';
import { DiscoveryService } from './discovery/discovery.service';
import { Public } from '@app/common';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    name: string;
    roles: string[];
    tenant: string;
    dbName: string;
  };
}

function prepareHeadersForAxios(
  headers: Request['headers'],
): RawAxiosRequestHeaders {
  const axiosHeaders: RawAxiosRequestHeaders = {};
  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      if (
        key.toLowerCase() === 'host' ||
        key.toLowerCase() === 'content-length' ||
        key.toLowerCase() === 'connection'
      ) {
        continue;
      }
      const value = headers[key];
      axiosHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
    }
  }
  return axiosHeaders;
}

@Controller()
export class RipcoreGatewayController {
  private readonly logger = new Logger(RipcoreGatewayController.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  @Public()
  @Get('api/diag/ping')
  async proxyPublicHealthCheck(@Req() req: Request) {
    return this.findAndProxy(req);
  }

  @All('api/*')
  async proxyToDynamicService(@Req() req: RequestWithUser) {
    return this.findAndProxy(req, req.user);
  }

  private async findAndProxy(req: Request, user?: RequestWithUser['user']) {
    const { method, originalUrl, body, headers } = req;

    const pathParts = originalUrl.split('/');
    if (pathParts.length < 3 || pathParts[1] !== 'api') {
      throw new BadRequestException('Formato de URL inválido');
    }
    const prefix = pathParts[2];

    const baseUrl = await this.discoveryService.getBaseUrlForPrefix(prefix);
    if (!baseUrl) {
      this.logger.warn(`No se encontró un módulo para el prefijo: ${prefix}`);
      throw new NotFoundException(
        `Servicio no encontrado para la ruta: ${originalUrl}`,
      );
    }

    const remainingPath = '/' + pathParts.slice(3).join('/');
    const targetUrl = `${baseUrl}${remainingPath}`;

    const forwardedHeaders = prepareHeadersForAxios(headers);

    if (user) {
      forwardedHeaders['X-User-ID'] = user.sub;
      forwardedHeaders['X-User-Name'] = user.name;
      forwardedHeaders['X-User-Roles'] = (user.roles || []).join(',');
      forwardedHeaders['X-Tenant-ID'] = user.tenant;
      forwardedHeaders['X-DBName-ID'] = user.dbName;
    }

    try {
      this.logger.log(`Proxing ${method} ${originalUrl} -> ${targetUrl}`);
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: targetUrl,
          data: body,
          headers: forwardedHeaders,
        }),
      );
      return response.data;
    } catch (error) {
      const e = error as AxiosError;
      if (e.response) {
        throw new HttpException(
          e.response.data || 'Upstream service error',
          e.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.error(`Error en proxy a ${targetUrl}`, error.stack);
      throw new BadGatewayException('Upstream service is unavailable');
    }
  }
}
