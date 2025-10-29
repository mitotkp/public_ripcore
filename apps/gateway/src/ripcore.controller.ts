import {
  Controller,
  Req,
  All,
  //UnauthorizedException,
  BadGatewayException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError, RawAxiosRequestHeaders } from 'axios';
//import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface RequestWithUSer extends Request {
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
  private ripcoreServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ripcoreServiceUrl =
      this.configService.get<string>('ripcoreServiceUrl')!;
  }

  @All('api/*')
  async proxyToRipcoreService(@Req() req: RequestWithUSer) {
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
          url: `${this.ripcoreServiceUrl}${originalUrl}`,
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
      console.error('Proxy error (Ripcore):', error.message);
      throw new BadGatewayException('Upstream service ripcore is unavailable');
    }
  }
}

// @Controller()
// export class RipcoreGatewayController {
//   private ripcoreServiceUrl = 'http://localhost:7575';

//   constructor(
//     private readonly httpService: HttpService,
//     private readonly jwtService: JwtService,
//   ) {}

//   @All('api/*')
//   async proxyToRipcoreService(@Req() req: Request) {
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
//           url: `${this.ripcoreServiceUrl}${originalUrl}`,
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
//       throw new BadGatewayException('Upstream service ripcore is unavailable');
//     }
//   }
// }
