import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import chokidar from 'chokidar';

import { CacheService } from './cache.service';

type FileType = 'assets' | 'definitions';
type Item = { version: string; hash: string };
type FileData = Record<string, Item[]>;
type Change = { platform: string; version: string; type: FileType };

@Injectable()
export class CacheWatcher implements OnModuleInit {
  private readonly logger = new Logger(CacheWatcher.name);
  private readonly fileContents = new Map<string, FileData>();
  public readonly changes = new EventEmitter();

  constructor(private readonly cacheService: CacheService) {}

  async onModuleInit() {
    const fixturesPath = path.join(process.cwd(), './fixtures');
    await this.primeCache(fixturesPath);

    const filesToWatch = [
      path.join(fixturesPath, 'assets-fixtures.json'),
      path.join(fixturesPath, 'definitions-fixtures.json'),
    ];

    const watcher = chokidar.watch(filesToWatch, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    });

    watcher.on('change', filePath => {
      void this.handleChange(filePath);
    });
    this.logger.log(`Watching: ${filesToWatch.join(', ')}`);
  }

  private fileTypeFromName(fileName: string): FileType {
    return fileName.includes('assets') ? 'assets' : 'definitions';
  }

  private async readJson<T>(filePath: string): Promise<T> {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  }

  private async primeCache(dir: string) {
    try {
      const entries = await fs.readdir(dir);
      const jsonFiles = entries.filter(f => f.endsWith('.json'));
      await Promise.all(
        jsonFiles.map(async file => {
          try {
            const data = await this.readJson<FileData>(path.join(dir, file));
            this.fileContents.set(file, data);
          } catch (e) {
            this.logger.error(
              `Failed to read ${file}: ${(e as Error).message}`,
            );
          }
        }),
      );
    } catch (e) {
      this.logger.error(`Init error: ${(e as Error).message}`);
    }
  }

  private diff(prev: FileData, curr: FileData, type: FileType): Change[] {
    const out: Change[] = [];
    const platforms = new Set([...Object.keys(prev), ...Object.keys(curr)]);

    for (const platform of platforms) {
      const pItems = prev[platform] ?? [];
      const cItems = curr[platform] ?? [];

      const p = new Map(pItems.map(i => [i.version, i.hash]));
      const c = new Map(cItems.map(i => [i.version, i.hash]));

      for (const [version, cHash] of c) {
        const pHash = p.get(version);
        if (!pHash || pHash !== cHash) out.push({ platform, version, type });
      }
      for (const version of p.keys()) {
        if (!c.has(version)) out.push({ platform, version, type });
      }
    }
    return out;
  }

  private async invalidate(changes: Change[]) {
    const keys = new Set<string>();
    for (const { platform, version, type } of changes) {
      keys.add(this.cacheService.generateCacheKey('config', platform, version));
      keys.add(this.cacheService.generateCacheKey(type, platform, version));
    }
    if (keys.size === 0) return;

    this.logger.log(`Invalidating: ${[...keys].join(', ')}`);
    for (const key of keys) await this.cacheService.del(key);
  }

  private async handleChange(filePath: string) {
    const fileName = path.basename(filePath);
    try {
      const curr = await this.readJson<FileData>(filePath);
      const prev = this.fileContents.get(fileName);
      if (!prev) {
        this.fileContents.set(fileName, curr);
        return;
      }

      const type = this.fileTypeFromName(fileName);
      const changes = this.diff(prev, curr, type);

      if (changes.length === 0) return;

      this.logger.log(`Changes in ${fileName}: ${changes.length}`);
      this.changes.emit('changes', { file: fileName, changes });

      await this.invalidate(changes);
      this.fileContents.set(fileName, curr);
    } catch (e) {
      this.logger.error(
        `Change error for ${fileName}: ${(e as Error).message}`,
      );
    }
  }
}
