import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({
    description: 'Код ошибки (HTTP статус)',
    example: 400,
  })
  code!: number;

  @ApiProperty({
    description: 'Сообщение об ошибке',
    example: 'Invalid platform: desktop',
  })
  message!: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Информация об ошибке',
    type: ErrorDto,
  })
  error!: ErrorDto;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'Информация об ошибке валидации',
    example: { error: { code: 400, message: 'Invalid platform: desktop' } },
  })
  error!: {
    code: 400;
    message: string;
  };
}

export class InternalServerErrorResponseDto {
  @ApiProperty({
    description: 'Информация о внутренней ошибке сервера',
    example: { error: { code: 500, message: 'Internal server error' } },
  })
  error!: {
    code: 500;
    message: string;
  };
}
