import {
  Controller,
  Req,
  All,
  UnauthorizedException,
  BadGatewayException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class RipcoreGatewayController {
  private ripcoreServiceUrl = 'http://localhost:7575';

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  @All('api/*')
  async proxyToRipcoreService(@Req() req: Request) {
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
          url: `${this.ripcoreServiceUrl}${originalUrl}`,
          data: body,
          headers: headers,
        }),
      );
      return response.data;
    } catch (error) {
      const e = error as AxiosError;
      if (e.response) {
        throw new HttpException(
          e.response.data || '',
          e.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new BadGatewayException('Upstream service ripcore is unavailable');
    }
  }
}
