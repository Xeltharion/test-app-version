import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { CacheModule } from './modules/cache/cache.module';
import { CacheWatcher } from './modules/cache/cache.watcher';
import { ConfigModule } from './modules/config/config.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    CacheModule,
    ConfigModule,
  ],
  providers: [CacheWatcher],
})
export class AppModule {}
