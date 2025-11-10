import {
  Controller,
  Body,
  Req,
  All,
  //UnauthorizedException,
  BadGatewayException,
  //UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError, RawAxiosRequestHeaders } from 'axios';
//import { JwtService } from '@nestjs/jwt';
import { Roles } from './roles.decorator';
//import { RolesGuard } from './roles.guard';
import { ConfigService } from '@nestjs/config';
import { Public } from './auth/decorators/public.decorator';
//import { resolve } from 'path';
//import { basename } from 'path/win32';

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
        key.toLocaleLowerCase() === 'host' ||
        key.toLocaleLowerCase() === 'content-length' ||
        key.toLocaleLowerCase() === 'connection'
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
export class AuthGatewayController {
  private authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    //private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('authServiceUrl')!;
  }

  @Public()
  @All([
    'api/auth/login/core',
    'api/auth/register/core',
    'api/auth/forgot-password',
    'api/auth/reset-password',
    'api/auth/login',
    'api/tenants/public-list',
    'api/auth/my-companies',
    'api/auth/switch-company',
  ])
  async proxyToAuthService(@Req() req: Request) {
    const { method, originalUrl, body, headers } = req;

    const forwardedHeaders = { ...headers };
    delete forwardedHeaders['host'];
    delete forwardedHeaders['content-length'];
    delete forwardedHeaders['connection'];

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.authServiceUrl}${originalUrl}`,
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
      console.error('Proxy error (Auth Public):', error.message);
      throw new BadGatewayException('Upstream service auth unavailable');
    }
  }

  @All([
    'api/auth/me',
    'api/auth/logout',
    'api/auth/select-company',
    'api/users/*',
    'api/modules/*',
    'api/auth/my-companies',
  ])
  async proxyToAuthModules(@Req() req: RequestWithUser) {
    const { method, originalUrl, body, headers, user } = req;

    const forwardedHeaders = { ...headers };
    delete forwardedHeaders['host'];
    delete forwardedHeaders['content-length'];
    delete forwardedHeaders['connection'];

    forwardedHeaders['X-User-ID'] = user.sub;
    forwardedHeaders['X-User-Name'] = user.name;
    forwardedHeaders['X-User-Roles'] = (user.roles || []).join(',');
    forwardedHeaders['X-Tenant-ID'] = user.tenant;
    forwardedHeaders['X-DBName-ID'] = user.dbName;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.authServiceUrl}${originalUrl}`,
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
      console.error('Proxy error (Auth Protected):', error.message);
      throw new BadGatewayException('Upstream service auth is unvailable');
    }
  }

  @All([
    'api/rbac/*',
    'api/tenants/*',
    'api/settings/*',
    'api/audit-logs/*',
    'api/audit-logs',
    'api/auth/admin/switch-context',
    'api/auth/admin/exit-context',
  ])
  @Roles('Admin', 'SuperAdmin', 'Soporte')
  async proxyToAdminModules(@Req() req: RequestWithUser) {
    const { method, originalUrl, body, headers, user } = req;

    const forwardedHeaders = prepareHeadersForAxios(headers);

    forwardedHeaders['X-User-ID'] = user.sub;
    forwardedHeaders['X-User-Name'] = user.name;
    forwardedHeaders['X-User-Roles'] = (user.roles || []).join(',');
    forwardedHeaders['X-Tenant-ID'] = user.tenant;
    forwardedHeaders['X-DBName-ID'] = user.dbName;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.authServiceUrl}${originalUrl}`,
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
      console.error('Proxy error (Auth Admin):', error.message);
      throw new BadGatewayException('Upstream service auth is unavailable');
    }
  }
}

// @Controller()
// export class AuthGatewayController {
//   private authServiceUrl = 'http://localhost:3001';

//   constructor(
//     private readonly httpService: HttpService,
//     private readonly jwtService: JwtService,
//   ) {}

//   @All([
//     'api/auth/login/core',
//     'api/auth/register/core',
//     'api/auth/forgot-password',
//     'api/auth/reset-password',
//     'api/auth/login',
//   ])
//   async proxyToAuthService(@Req() req: Request) {
//     const { method, originalUrl, body, headers } = req;

//     delete headers['host'];
//     delete headers['content-length'];

//     try {
//       const response = await firstValueFrom(
//         this.httpService.request({
//           method,
//           url: `${this.authServiceUrl}${originalUrl}`,
//           data: body,
//           headers: headers,
//         }),
//       );
//       return response.data;
//     } catch (error) {
//       const e = error as AxiosError;
//       if (e.response) {
//         throw new HttpException(
//           e.response.data || '',
//           e.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       }
//       throw error;
//     }
//   }
//   @All([
//     'api/auth/me',
//     'api/auth/logout',
//     'api/auth/select-company',
//     'api/users/*',
//   ])
//   async proxyToAuthModules(@Req() req: Request) {
//     const { method, originalUrl, body, headers } = req;

//     const authHeader = headers['authorization'];
//     if (!authHeader) {
//       throw new UnauthorizedException('Authorization header is missing');
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       throw new UnauthorizedException('Token is missing');
//     }

//     let tokenPayload: any;
//     try {
//       tokenPayload = this.jwtService.verify(token);
//     } catch (error) {
//       console.log(error);
//       throw new UnauthorizedException('Invalid or expired token');
//     }

//     delete headers['host'];
//     delete headers['content-length'];
//     delete headers['connection'];

//     headers['X-User-ID'] = tokenPayload.sub;
//     headers['X-User-Name'] = tokenPayload.name;
//     headers['X-User-Roles'] = (tokenPayload.roles || []).join(',');
//     headers['X-Tenant-ID'] = tokenPayload.tenant;
//     headers['X-DBName-ID'] = tokenPayload.dbName;
//     try {
//       const response = await firstValueFrom(
//         this.httpService.request({
//           method,
//           url: `${this.authServiceUrl}${originalUrl}`,
//           data: body,
//           headers: headers,
//         }),
//       );
//       return response.data;
//     } catch (error) {
//       const e = error as AxiosError;
//       if (e.response) {
//         throw new HttpException(
//           e.response.data || '',
//           e.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       }
//       throw new BadGatewayException('Upstream service auth is unvailable');
//     }
//   }

//   @All(['api/rbac/*', 'api/tenants/*', 'api/settings/*', 'api/audit-logs/*'])
//   @UseGuards(RolesGuard)
//   @Roles('Admin', 'SuperAdmin', 'Soporte')
//   async proxyToAdminModules(@Req() req: Request) {
//     const { method, originalUrl, body, headers } = req;

//     const authHeader = headers['authorization'];
//     if (!authHeader || typeof authHeader !== 'string') {
//       throw new UnauthorizedException(
//         'Authorization header is missing or invalid',
//       );
//     }
//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       throw new UnauthorizedException('Token is missing');
//     }

//     const tokenPayload = this.jwtService.decode(token);

//     delete headers['host'];
//     delete headers['content-length'];
//     delete headers['connection'];

//     headers['X-User-ID'] = tokenPayload.sub;
//     headers['X-User-Name'] = tokenPayload.name;
//     headers['X-User-Roles'] = (tokenPayload.roles || []).join(',');
//     headers['X-Tenant-ID'] = tokenPayload.tenant;
//     headers['X-DBName-ID'] = tokenPayload.dbName;

//     try {
//       const response = await firstValueFrom(
//         this.httpService.request({
//           method,
//           url: `${this.authServiceUrl}${originalUrl}`,
//           data: body,
//           headers: headers,
//         }),
//       );
//       return response.data;
//     } catch (error) {
//       const e = error as AxiosError;
//       if (e.response) {
//         throw new HttpException(
//           e.response.data || '',
//           e.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       }
//       throw new BadGatewayException('Upstream service auth is unavailable');
//     }
//   }
// }
