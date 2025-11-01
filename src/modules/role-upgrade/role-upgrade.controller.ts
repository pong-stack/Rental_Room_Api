import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RoleUpgradeService } from './role-upgrade.service';
import { CreateRoleUpgradeRequestDto } from './dto/create-role-upgrade-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UpgradeRequestStatus } from '../../entities/role-upgrade-request.entity';

@Controller('role-upgrade')
@UseGuards(JwtAuthGuard)
export class RoleUpgradeController {
  constructor(private readonly roleUpgradeService: RoleUpgradeService) {}

  @Post('request')
  async createRoleUpgradeRequest(
    @Body() createDto: CreateRoleUpgradeRequestDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    const request = await this.roleUpgradeService.createRoleUpgradeRequest(createDto, req.user.id);
    return ApiResponseDto.created('Role upgrade request created successfully', request);
  }

  @Get('my-requests')
  async getMyRoleUpgradeRequests(@Request() req): Promise<ApiResponseDto> {
    const requests = await this.roleUpgradeService.getMyRoleUpgradeRequests(req.user.id);
    return ApiResponseDto.success('Role upgrade requests retrieved successfully', requests);
  }

  @Get('my-requests/:id')
  async getRoleUpgradeRequestById(
    @Param('id') id: number,
    @Request() req
  ): Promise<ApiResponseDto> {
    const request = await this.roleUpgradeService.getRoleUpgradeRequestById(id, req.user.id);
    return ApiResponseDto.success('Role upgrade request retrieved successfully', request);
  }

  @Delete('my-requests/:id')
  async cancelRoleUpgradeRequest(@Param('id') id: number, @Request() req): Promise<ApiResponseDto> {
    await this.roleUpgradeService.cancelRoleUpgradeRequest(id, req.user.id);
    return ApiResponseDto.success('Role upgrade request cancelled successfully', null);
  }

  // Admin endpoints
  @Get('admin/requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllRoleUpgradeRequests(): Promise<ApiResponseDto> {
    const requests = await this.roleUpgradeService.getAllRoleUpgradeRequests();
    return ApiResponseDto.success('All role upgrade requests retrieved successfully', requests);
  }

  @Post('admin/requests/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveRoleUpgradeRequest(
    @Param('id') id: number,
    @Body() body: { adminComment?: string },
    @Request() req
  ): Promise<ApiResponseDto> {
    const request = await this.roleUpgradeService.reviewRoleUpgradeRequest(
      id,
      UpgradeRequestStatus.APPROVED,
      body.adminComment || null,
      req.user.id
    );
    return ApiResponseDto.success('Role upgrade request approved successfully', request);
  }

  @Post('admin/requests/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectRoleUpgradeRequest(
    @Param('id') id: number,
    @Body() body: { adminComment?: string },
    @Request() req
  ): Promise<ApiResponseDto> {
    const request = await this.roleUpgradeService.reviewRoleUpgradeRequest(
      id,
      UpgradeRequestStatus.REJECTED,
      body.adminComment || null,
      req.user.id
    );
    return ApiResponseDto.success('Role upgrade request rejected successfully', request);
  }
}
