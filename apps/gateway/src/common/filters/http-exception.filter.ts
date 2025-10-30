import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseBody: any;

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      responseBody =
        typeof errorResponse === 'string'
          ? { statusCode: httpStatus, message: errorResponse }
          : { statusCode: httpStatus, ...errorResponse };
    } else {
      this.logger.error(
        `Unhandled Exception: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
        'ExceptionFilter',
      );
      responseBody = {
        statusCode: httpStatus,
        message: 'Internal server error',
      };
    }

    if (typeof responseBody === 'string') {
      responseBody = { statusCode: httpStatus, message: responseBody };
    } else if (!responseBody.statusCode) {
      responseBody.statusCode = httpStatus;
    }

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
