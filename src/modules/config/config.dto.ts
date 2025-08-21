import { ApiProperty } from '@nestjs/swagger';

import { IsIn, IsString, Matches } from 'class-validator';

export class ConfigQueryDto {
  @ApiProperty({
    description: 'Версия в формате MAJOR.MINOR.PATCH',
    example: '13.6.956',
    pattern: '^\\d+\\.\\d+\\.\\d+$',
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'appVersion must be in format MAJOR.MINOR.PATCH',
  })
  appVersion!: string;

  @ApiProperty({
    enum: ['android', 'ios'],
    example: 'android',
  })
  @IsString()
  @IsIn(['android', 'ios'])
  platform!: string;
}

export class BackendEntryPointDto {
  @ApiProperty({
    example: 'api.application.com/jsonrpc/v2',
  })
  jsonrpc_url!: string;
}

export class AssetConfigDto {
  @ApiProperty({
    example: '13.5.275',
  })
  version!: string;

  @ApiProperty({
    example: '0b313712189f60d9f46d36577140fb58beaec610353850f050cb8975f56ae381',
  })
  hash!: string;

  @ApiProperty({
    type: [String],
    example: ['dhm.cdn.application.com', 'ehz.cdn.application.com'],
  })
  urls!: readonly string[];
}

export class NotificationsConfigDto {
  @ApiProperty({
    example: 'notifications.application.com/jsonrpc/v1',
  })
  jsonrpc_url!: string;
}

export class ConfigResponseDto {
  @ApiProperty({
    type: BackendEntryPointDto,
    example: { jsonrpc_url: 'api.application.com/jsonrpc/v2' },
  })
  backend_entry_point!: BackendEntryPointDto;

  @ApiProperty({
    type: AssetConfigDto,
    example: {
      version: '13.5.275',
      hash: '0b313712189f60d9f46d36577140fb58beaec610353850f050cb8975f56ae381',
      urls: ['dhm.cdn.application.com', 'ehz.cdn.application.com'],
    },
  })
  assets!: AssetConfigDto;

  @ApiProperty({
    type: AssetConfigDto,
    example: {
      version: '13.6.610',
      hash: '0d3606b99d782464b49dcf449c3c7e8551929abb1d7c00d9fec2ff522afd4f32',
      urls: ['eau.cdn.application.com', 'tbm.cdn.application.com'],
    },
  })
  definitions!: AssetConfigDto;

  @ApiProperty({
    type: NotificationsConfigDto,
    example: { jsonrpc_url: 'notifications.application.com/jsonrpc/v1' },
  })
  notifications!: NotificationsConfigDto;
}
