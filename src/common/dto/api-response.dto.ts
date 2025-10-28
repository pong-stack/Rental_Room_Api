import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  timestamp?: string;
}

export class ApiResponseDto<T = any> implements ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  timestamp: string;

  constructor(status: number, message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(message: string, data?: T, status: number = HttpStatus.OK): ApiResponseDto<T> {
    return new ApiResponseDto(status, message, data);
  }

  static error(message: string, status: number = HttpStatus.INTERNAL_SERVER_ERROR): ApiResponseDto {
    return new ApiResponseDto(status, message);
  }

  static created<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto(HttpStatus.CREATED, message, data);
  }

  static notFound(message: string = 'Resource not found'): ApiResponseDto {
    return new ApiResponseDto(HttpStatus.NOT_FOUND, message);
  }

  static badRequest(message: string = 'Bad request'): ApiResponseDto {
    return new ApiResponseDto(HttpStatus.BAD_REQUEST, message);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiResponseDto {
    return new ApiResponseDto(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiResponseDto {
    return new ApiResponseDto(HttpStatus.FORBIDDEN, message);
  }
}
