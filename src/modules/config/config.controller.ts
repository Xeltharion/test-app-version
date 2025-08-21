import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  InternalServerErrorResponseDto,
  ValidationErrorResponseDto,
} from '../../common/dto/error.dto';
import { ConfigQueryDto, ConfigResponseDto } from './config.dto';
import { ConfigService } from './config.service';
import { IConfigResponse } from './config.types';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Конфигурация успешно получена',
    type: ConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные параметры запроса (ошибка валидации)',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера',
    type: InternalServerErrorResponseDto,
  })
  async getConfig(@Query() query: ConfigQueryDto): Promise<IConfigResponse> {
    return this.configService.getConfig(query);
  }
}
