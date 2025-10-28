import {
  Controller,
  Body,
  Req,
  All,
  UnauthorizedException,
  BadGatewayException,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';

@Controller()
export class AuthGatewayController {
  private authServiceUrl = 'http://localhost:3001';

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  @All([
    'api/auth/login/core',
    'api/auth/register/core',
    'api/auth/forgot-password',
    'api/auth/reset-password',
    'api/auth/login',
  ])
  async proxyToAuthService(@Req() req: Request) {
    const { method, originalUrl, body, headers } = req;

    delete headers['host'];
    delete headers['content-length'];

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.authServiceUrl}${originalUrl}`,
          data: body,
          headers: headers,
        }),
      );
      return response.data;
    } catch (error) {
      const e = error as AxiosError;
      if (e.response) {
        return e.response.data;
      }
      throw error;
    }
  }
  @All([
    'api/auth/me',
    'api/auth/logout',
    'api/auth/select-company',
    'api/users/*',
  ])
  async proxyToAuthModules(@Req() req: Request) {
    const { method, originalUrl, body, headers } = req;

    const authHeader = headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    let tokenPayload: any;
    try {
      tokenPayload = this.jwtService.verify(token);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }

    delete headers['host'];
    delete headers['content-length'];
    delete headers['connection'];

    headers['X-User-ID'] = tokenPayload.sub;
    headers['X-User-Name'] = tokenPayload.name;
    headers['X-User-Roles'] = (tokenPayload.roles || []).join(',');
    headers['X-Tenant-ID'] = tokenPayload.tenant;
    headers['X-DBName-ID'] = tokenPayload.dbName;
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.authServiceUrl}${originalUrl}`,
          data: body,
          headers: headers,
        }),
      );
      return response.data;
    } catch (error) {
      const e = error as AxiosError;
      if (e.response) {
        return e.response?.data;
      }
      throw new BadGatewayException('Upstream service auth is unvailable');
    }
  }

  @All(['api/rbac/*', 'api/tenants/*', 'api/settings/*', 'api/audit-logs/*'])
  @UseGuards(RolesGuard)
  @Roles('Admin', 'SuperAdmin', 'Soporte')
  async proxyToAdminModules(@Req() req: Request) {
    const { method, originalUrl, body, headers } = req;

    const token = headers['authorization'].split(' ')[1];
    const tokenPayload = this.jwtService.decode(token) as any;

    delete headers['host'];
    delete headers['content-length'];
    delete headers['connection'];

    headers['X-User-ID'] = tokenPayload.sub;
    headers['X-User-Name'] = tokenPayload.name;
    headers['X-User-Roles'] = (tokenPayload.roles || []).join(',');
    headers['X-Tenant-ID'] = tokenPayload.tenant;
    headers['X-DBName-ID'] = tokenPayload.dbName;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.authServiceUrl}${originalUrl}`,
          data: body,
          headers: headers,
        }),
      );
      return response.data;
    } catch (error) {
      const e = error as AxiosError;
      if (e.response) {
        return e.response?.data;
      }
      throw new BadGatewayException('Upstream service auth is unavailable');
    }
  }
}
