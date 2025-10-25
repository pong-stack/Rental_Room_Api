import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
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
    };
  }
}
