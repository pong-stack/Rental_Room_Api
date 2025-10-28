import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request')
  @Roles(UserRole.HOME_OWNER)
  @UseGuards(RolesGuard)
  async createVerificationRequest(
    @Body() createDto: CreateVerificationRequestDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    const request = await this.verificationService.createVerificationRequest(
      createDto,
      req.user.id
    );
    return ApiResponseDto.created('Verification request created successfully', request);
  }

  @Get('my-requests')
  @Roles(UserRole.HOME_OWNER)
  @UseGuards(RolesGuard)
  async getMyVerificationRequests(@Request() req): Promise<ApiResponseDto> {
    const requests = await this.verificationService.getMyVerificationRequests(req.user.id);
    return ApiResponseDto.success('Verification requests retrieved successfully', requests);
  }

  @Get('requests/:id')
  async getVerificationRequestById(
    @Param('id') id: number,
    @Request() req
  ): Promise<ApiResponseDto> {
    const request = await this.verificationService.getVerificationRequestById(id, req.user.id);
    return ApiResponseDto.success('Verification request retrieved successfully', request);
  }

  @Delete('requests/:id')
  @Roles(UserRole.HOME_OWNER)
  @UseGuards(RolesGuard)
  async cancelVerificationRequest(
    @Param('id') id: number,
    @Request() req
  ): Promise<ApiResponseDto> {
    await this.verificationService.cancelVerificationRequest(id, req.user.id);
    return ApiResponseDto.success('Verification request cancelled successfully');
  }
}
