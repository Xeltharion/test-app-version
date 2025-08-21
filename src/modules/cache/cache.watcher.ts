import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { CacheService } from './cache.service';

interface FileData {
  [platform: string]: Array<{ version: string; hash: string }>;
}

@Injectable()
export class CacheWatcher implements OnModuleInit {
  private readonly logger = new Logger(CacheWatcher.name);
  private fileContents: Map<string, FileData> = new Map();

  constructor(private readonly cacheService: CacheService) {}

  onModuleInit() {
    const fixturesPath = path.join(process.cwd(), 'src/fixtures');

    this.initializeFileContents(fixturesPath);

    setInterval(() => {
      this.checkForChanges(fixturesPath);
    }, 1000);

    this.logger.log(`Started watching directory with polling: ${fixturesPath}`);
  }

  private initializeFileContents(fixturesPath: string): void {
    try {
      const files = fs
        .readdirSync(fixturesPath)
        .filter(f => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(fixturesPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content) as FileData;
        this.fileContents.set(file, data);
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize file contents: ${(error as Error).message}`,
      );
    }
  }

  private checkForChanges(fixturesPath: string): void {
    try {
      const files = fs
        .readdirSync(fixturesPath)
        .filter(f => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(fixturesPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const currentData = JSON.parse(content) as FileData;
        const previousData = this.fileContents.get(file);

        if (previousData) {
          const changes = this.detectChanges(previousData, currentData, file);
          if (changes.length > 0) {
            this.logger.log(`Changes detected in ${file}:`);
            void this.handleFileChanges(changes);
            this.fileContents.set(file, currentData);
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error checking for file changes: ${(error as Error).message}`,
      );
    }
  }

  private detectChanges(
    previousData: FileData,
    currentData: FileData,
    fileName: string,
  ): Array<{
    platform: string;
    version: string;
    type: 'assets' | 'definitions';
  }> {
    const changes: Array<{
      platform: string;
      version: string;
      type: 'assets' | 'definitions';
    }> = [];
    const fileType = fileName.includes('assets') ? 'assets' : 'definitions';

    for (const platform of Object.keys(currentData)) {
      const currentItems = currentData[platform] || [];
      const previousItems = previousData[platform] || [];

      const previousMap = new Map(
        previousItems.map(item => [item.version, item.hash]),
      );
      const currentMap = new Map(
        currentItems.map(item => [item.version, item.hash]),
      );

      for (const [version, currentHash] of currentMap) {
        const previousHash = previousMap.get(version);
        if (previousHash && previousHash !== currentHash) {
          changes.push({ platform, version, type: fileType });
          this.logger.log(
            `  ${platform}:${version} hash changed from ${previousHash} to ${currentHash}`,
          );
        } else if (!previousHash) {
          changes.push({ platform, version, type: fileType });
          this.logger.log(
            `  ${platform}:${version} added with hash ${currentHash}`,
          );
        }
      }

      for (const [version] of previousMap) {
        if (!currentMap.has(version)) {
          changes.push({ platform, version, type: fileType });
          this.logger.log(`  ${platform}:${version} removed`);
        }
      }
    }

    return changes;
  }

  private async handleFileChanges(
    changes: Array<{
      platform: string;
      version: string;
      type: 'assets' | 'definitions';
    }>,
  ): Promise<void> {
    const keysToInvalidate = new Set<string>();

    for (const change of changes) {
      const configKey = this.cacheService.generateCacheKey(
        'config',
        change.platform,
        change.version,
      );
      const typeKey = this.cacheService.generateCacheKey(
        change.type,
        change.platform,
        change.version,
      );

      keysToInvalidate.add(configKey);
      keysToInvalidate.add(typeKey);
    }

    this.logger.log(
      `Invalidating cache keys: ${Array.from(keysToInvalidate).join(', ')}`,
    );

    for (const key of keysToInvalidate) {
      await this.cacheService.del(key);
    }
  }
}
