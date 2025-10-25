import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API information object', () => {
      const result = appController.getHello();
      expect(result).toEqual({
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
