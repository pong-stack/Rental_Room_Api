import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect(res => {
        expect(res.body).toEqual({
          message: 'Welcome to NestJS API',
          version: '1.0.0',
          status: 'running',
          endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            admin: '/api/v1/admin',
            homes: '/api/v1/homes',
            invoices: '/api/v1/invoices',
            verification: '/api/v1/verification',
          },
        });
      });
  });
});
