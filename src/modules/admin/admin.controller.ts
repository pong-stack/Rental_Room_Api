import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('statistics')
  async getStatistics(): Promise<ApiResponseDto> {
    const stats = await this.adminService.getStatistics();
    return ApiResponseDto.success('Statistics retrieved successfully', stats);
  }

  @Get('verification-requests')
  async getAllVerificationRequests(): Promise<ApiResponseDto> {
    const requests = await this.adminService.getAllVerificationRequests();
    return ApiResponseDto.success('Verification requests retrieved successfully', requests);
  }

  @Get('verification-requests/:id')
  async getVerificationRequestById(@Param('id') id: number): Promise<ApiResponseDto> {
    const request = await this.adminService.getVerificationRequestById(id);
    return ApiResponseDto.success('Verification request retrieved successfully', request);
  }

  @Put('verification-requests/:id/review')
  async reviewVerificationRequest(
    @Param('id') id: number,
    @Body() reviewDto: ReviewVerificationDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    const result = await this.adminService.reviewVerificationRequest(id, reviewDto, req.user.id);
    return ApiResponseDto.success('Verification request reviewed successfully', result);
  }

  @Get('users')
  async getAllUsers(): Promise<ApiResponseDto> {
    const users = await this.adminService.getAllUsers();
    return ApiResponseDto.success('Users retrieved successfully', users);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: number): Promise<ApiResponseDto> {
    const user = await this.adminService.getUserById(id);
    return ApiResponseDto.success('User retrieved successfully', user);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: number,
    @Body() body: { role: UserRole }
  ): Promise<ApiResponseDto> {
    const result = await this.adminService.updateUserRole(id, body.role);
    return ApiResponseDto.success('User role updated successfully', result);
  }

  @Get('homes')
  async getAllHomes(): Promise<ApiResponseDto> {
    const homes = await this.adminService.getAllHomes();
    return ApiResponseDto.success('Homes retrieved successfully', homes);
  }

  @Get('homes/:id')
  async getHomeById(@Param('id') id: number): Promise<ApiResponseDto> {
    const home = await this.adminService.getHomeById(id);
    return ApiResponseDto.success('Home retrieved successfully', home);
  }
}
