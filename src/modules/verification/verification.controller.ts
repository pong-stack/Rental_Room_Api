import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request')
  @Roles(UserRole.HOME_OWNER)
  @UseGuards(RolesGuard)
  async createVerificationRequest(@Body() createDto: CreateVerificationRequestDto, @Request() req) {
    return this.verificationService.createVerificationRequest(createDto, req.user.id);
  }

  @Get('my-requests')
  @Roles(UserRole.HOME_OWNER)
  @UseGuards(RolesGuard)
  async getMyVerificationRequests(@Request() req) {
    return this.verificationService.getMyVerificationRequests(req.user.id);
  }

  @Get('requests/:id')
  async getVerificationRequestById(@Param('id') id: number, @Request() req) {
    return this.verificationService.getVerificationRequestById(id, req.user.id);
  }

  @Delete('requests/:id')
  @Roles(UserRole.HOME_OWNER)
  @UseGuards(RolesGuard)
  async cancelVerificationRequest(@Param('id') id: number, @Request() req) {
    await this.verificationService.cancelVerificationRequest(id, req.user.id);
    return { message: 'Verification request cancelled successfully' };
  }
}
