import { Module } from '@nestjs/common';

import { FixturesService } from './fixtures.service';

@Module({
  exports: [FixturesService],
  providers: [FixturesService],
})
export class FixturesModule {}
