import { Injectable, Logger } from '@nestjs/common';

import * as semver from 'semver';

import { ApiException } from '../../common/exceptions/api.exception';
import { CacheService } from '../cache/cache.service';
import { FixturesService } from '../fixtures/fixtures.service';
import { appConfig } from './config.config';
import { ConfigQueryDto } from './config.dto';
import { IAssetConfig, IConfigResponse } from './config.types';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    private readonly fixturesService: FixturesService,
    private readonly cacheService: CacheService,
  ) {}

  async getConfig(query: ConfigQueryDto): Promise<IConfigResponse> {
    this.logger.log(`Config request: ${query.appVersion} (${query.platform})`);

    const cacheKey = this.cacheService.generateCacheKey(
      'config',
      query.platform,
      query.appVersion,
    );
    const cached = await this.cacheService.get<IConfigResponse>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached;
    }

    const assetsConfig = this.findAssets(query);
    const definitionsConfig = this.findDefinitions(query);

    const config = this.buildConfigResponse(assetsConfig, definitionsConfig);

    await this.cacheService.set(cacheKey, config, appConfig.cache.ttl);

    this.logger.log(
      `Config sent: assets=${assetsConfig.version}, definitions=${definitionsConfig.version}`,
    );
    return config;
  }

  private findAssets(query: ConfigQueryDto): IAssetConfig {
    const platformAssets = this.fixturesService.getAssetsByPlatform(
      query.platform,
    );
    const compatible = platformAssets.filter(a =>
      this.isAssetsCompatible(query.appVersion, a.version),
    );

    if (compatible.length === 0) {
      this.throwNotFound(query.appVersion, query.platform);
    }

    const response = this.findVersion(compatible);
    if (!response) this.throwNotFound(query.appVersion, query.platform);

    return response;
  }

  private findDefinitions(query: ConfigQueryDto): IAssetConfig {
    const platformDefinitions = this.fixturesService.getDefinitionsByPlatform(
      query.platform,
    );
    const compatible = platformDefinitions.filter(d =>
      this.isDefinitionsCompatible(query.appVersion, d.version),
    );

    if (compatible.length === 0) {
      this.throwNotFound(query.appVersion, query.platform);
    }

    const response = this.findVersion(compatible);
    if (!response) this.throwNotFound(query.appVersion, query.platform);

    return response;
  }

  private buildConfigResponse(
    assetsConfig: IAssetConfig,
    definitionsConfig: IAssetConfig,
  ): IConfigResponse {
    return {
      assets: {
        hash: assetsConfig.hash,
        urls: appConfig.urls.assets,
        version: assetsConfig.version,
      },
      backend_entry_point: appConfig.urls.backend_entry_point,
      definitions: {
        hash: definitionsConfig.hash,
        urls: appConfig.urls.definitions,
        version: definitionsConfig.version,
      },
      notifications: appConfig.urls.notifications,
    };
  }

  private throwNotFound(appVersion: string, platform: string): never {
    throw ApiException.notFound(
      `Configuration not found for appVersion ${appVersion} (${platform})`,
    );
  }

  isAssetsCompatible(appVersion: string, assetsVersion: string): boolean {
    const appSemVer = semver.parse(appVersion);
    const assetsSemVer = semver.parse(assetsVersion);
    return appSemVer?.major === assetsSemVer?.major;
  }

  isDefinitionsCompatible(
    appVersion: string,
    definitionsVersion: string,
  ): boolean {
    const appSemVer = semver.parse(appVersion);
    const defSemVer = semver.parse(definitionsVersion);
    return (
      appSemVer?.major === defSemVer?.major &&
      appSemVer?.minor === defSemVer?.minor
    );
  }

  findVersion(configs: IAssetConfig[]): IAssetConfig | null {
    if (configs.length === 0) return null;

    const version = semver.maxSatisfying(
      configs.map(c => c.version),
      '*',
    );

    if (!version) return null;

    return configs.find(c => c.version === version) ?? null;
  }
}
