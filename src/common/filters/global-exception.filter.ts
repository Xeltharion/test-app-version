import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

import { ApiException } from '../exceptions/api.exception';

interface IErrorResponse {
  error: { code: number; message: string };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<import('express').Response>();

    let status = 500;
    let errorResponse: IErrorResponse;

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse() as IErrorResponse;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
        };
        if (Array.isArray(responseObj.message)) {
          errorResponse = {
            error: {
              code: status,
              message: responseObj.message.join(', '),
            },
          };
        } else {
          errorResponse = {
            error: {
              code: status,
              message: responseObj.message || exception.message || 'HTTP Error',
            },
          };
        }
      } else {
        errorResponse = {
          error: {
            code: status,
            message: exception.message || 'HTTP Error',
          },
        };
      }
    } else {
      errorResponse = {
        error: { code: 500, message: 'Internal server error' },
      };
      this.logger.error('Unhandled exception:', exception);
    }

    response.status(status).json(errorResponse);
  }
}
