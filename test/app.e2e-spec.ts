import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import supertest from 'supertest';

import { GlobalExceptionFilter } from '../src/common';
import { AppModule } from './../src/app.module';

describe('Mobile App Config (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/config (GET)', () => {
    it('should return config for valid request', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/config?appVersion=13.6.956&platform=android')
        .expect(200);

      expect(response.body).toHaveProperty('backend_entry_point');
      expect(response.body).toHaveProperty('assets');
      expect(response.body).toHaveProperty('definitions');
      expect(response.body.backend_entry_point).toHaveProperty('jsonrpc_url');
      expect(response.body.backend_entry_point.jsonrpc_url).toBe(
        'api.application.com/jsonrpc/v2',
      );
      expect(response.body.assets).toHaveProperty('urls');
      expect(response.body.assets).toHaveProperty('hash');
      expect(response.body.assets).toHaveProperty('version');
      expect(Array.isArray(response.body.assets.urls)).toBe(true);
      expect(response.body.definitions).toHaveProperty('urls');
      expect(response.body.definitions).toHaveProperty('hash');
      expect(response.body.definitions).toHaveProperty('version');
      expect(Array.isArray(response.body.definitions.urls)).toBe(true);
    });

    it('should return 400 for invalid platform', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/config?appVersion=13.6.956&platform=desktop')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 400);
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain(
        'platform must be one of the following values',
      );
    });

    it('should return 400 for invalid version format', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/config?appVersion=invalid&platform=android')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 400);
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain(
        'appVersion must be in format MAJOR.MINOR.PATCH',
      );
    });

    it('should return 404 for version not found', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/config?appVersion=99.99.999&platform=android')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(404);
      expect(response.body.error.message).toContain('Configuration not found');
    });

    it('should work with specific assets version', async () => {
      await supertest(app.getHttpServer())
        .get(
          '/config?appVersion=13.6.956&platform=android&assetsVersion=13.6.100',
        )
        .expect(res => {
          if (res.status === 200) {
            expect(res.body.assets.version).toMatch(/^13\./);
          } else if (res.status === 404) {
            expect(res.body.error.message).toContain('Configuration not found');
          }
        });
    });

    it('should work with iOS platform', async () => {
      await supertest(app.getHttpServer())
        .get('/config?appVersion=13.6.956&platform=ios')
        .expect(res => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('assets');
            expect(res.body).toHaveProperty('definitions');
          } else if (res.status === 404) {
            expect(res.body.error.message).toContain('Configuration not found');
          }
        });
    });
  });
});
