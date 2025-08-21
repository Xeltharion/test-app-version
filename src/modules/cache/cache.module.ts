import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { appConfig } from '../config/config.config';
import { CacheService } from './cache.service';

@Module({
  exports: [CacheService],
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      max: appConfig.cache.max,
      ttl: appConfig.cache.ttl,
    }),
  ],
  providers: [CacheService],
})
export class CacheModule {}
