import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('verification')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request')
  // @Roles(UserRole.HOME_OWNER)
  // @UseGuards(RolesGuard) // Temporarily disabled for testing
  async createVerificationRequest(
    @Body() createDto: CreateVerificationRequestDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    const request = await this.verificationService.createVerificationRequest(createDto, userId);
    return ApiResponseDto.created('Verification request created successfully', request);
  }

  @Get('my-requests')
  // @Roles(UserRole.HOME_OWNER)
  // @UseGuards(RolesGuard) // Temporarily disabled for testing
  async getMyVerificationRequests(@Request() req): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    const requests = await this.verificationService.getMyVerificationRequests(userId);
    return ApiResponseDto.success('Verification requests retrieved successfully', requests);
  }

  @Get('requests/:id')
  async getVerificationRequestById(
    @Param('id') id: number,
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    const request = await this.verificationService.getVerificationRequestById(id, userId);
    return ApiResponseDto.success('Verification request retrieved successfully', request);
  }

  @Delete('requests/:id')
  // @Roles(UserRole.HOME_OWNER)
  // @UseGuards(RolesGuard) // Temporarily disabled for testing
  async cancelVerificationRequest(
    @Param('id') id: number,
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    await this.verificationService.cancelVerificationRequest(id, userId);
    return ApiResponseDto.success('Verification request cancelled successfully');
  }
}
