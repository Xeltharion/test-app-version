import { Injectable } from '@nestjs/common';

import * as assetsData from '../../../fixtures/assets-fixtures.json';
import * as definitionsData from '../../../fixtures/definitions-fixtures.json';
import { IAssetConfig } from '../config/config.types';

@Injectable()
export class FixturesService {
  getAssetsByPlatform(platform: string): IAssetConfig[] {
    return (assetsData as Record<string, IAssetConfig[]>)[platform] ?? [];
  }

  getDefinitionsByPlatform(platform: string): IAssetConfig[] {
    return (definitionsData as Record<string, IAssetConfig[]>)[platform] ?? [];
  }

  findAssetByVersion(
    platform: string,
    version: string,
  ): IAssetConfig | undefined {
    const assets = this.getAssetsByPlatform(platform);
    return assets.find(asset => asset.version === version);
  }

  findDefinitionByVersion(
    platform: string,
    version: string,
  ): IAssetConfig | undefined {
    const definitions = this.getDefinitionsByPlatform(platform);
    return definitions.find(definition => definition.version === version);
  }
}
