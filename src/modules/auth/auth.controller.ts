import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto> {
    const result = await this.authService.login(loginDto);
    return ApiResponseDto.success('Login successful', result);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto> {
    const result = await this.authService.register(registerDto);
    return ApiResponseDto.created('User registered successfully', result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): ApiResponseDto {
    return ApiResponseDto.success('Profile retrieved successfully', req.user);
  }
}
