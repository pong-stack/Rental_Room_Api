import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get('verification-requests')
  async getAllVerificationRequests() {
    return this.adminService.getAllVerificationRequests();
  }

  @Get('verification-requests/:id')
  async getVerificationRequestById(@Param('id') id: number) {
    return this.adminService.getVerificationRequestById(id);
  }

  @Put('verification-requests/:id/review')
  async reviewVerificationRequest(
    @Param('id') id: number,
    @Body() reviewDto: ReviewVerificationDto,
    @Request() req
  ) {
    return this.adminService.reviewVerificationRequest(id, reviewDto, req.user.id);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: number) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: number, @Body() body: { role: UserRole }) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Get('homes')
  async getAllHomes() {
    return this.adminService.getAllHomes();
  }

  @Get('homes/:id')
  async getHomeById(@Param('id') id: number) {
    return this.adminService.getHomeById(id);
  }
}
