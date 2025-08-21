import { HttpException, HttpStatus } from '@nestjs/common';

interface IApiErrorResponse {
  error: {
    code: number;
    message: string;
  };
}

export class ApiException extends HttpException {
  constructor(code: number, message: string) {
    const response: IApiErrorResponse = {
      error: {
        code,
        message,
      },
    };

    super(response, code);
  }

  static badRequest(message: string): ApiException {
    return new ApiException(HttpStatus.BAD_REQUEST, message);
  }

  static notFound(message: string): ApiException {
    return new ApiException(HttpStatus.NOT_FOUND, message);
  }

  static internalServerError(message: string): ApiException {
    return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
