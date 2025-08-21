import { Module } from '@nestjs/common';

import { CacheModule } from '../cache/cache.module';
import { FixturesModule } from '../fixtures/fixtures.module';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

@Module({
  controllers: [ConfigController],
  imports: [FixturesModule, CacheModule],
  providers: [ConfigService],
})
export class ConfigModule {}
