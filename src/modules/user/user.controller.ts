import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    role: UserRole;
    email: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<ApiResponseDto> {
    const users = await this.userService.findAll();
    return ApiResponseDto.success('Users retrieved successfully', users);
  }

  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<ApiResponseDto> {
    const profile = await this.userService.getProfile(req.user.id);
    return ApiResponseDto.success('Profile retrieved successfully', profile);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponseDto> {
    // Allow users to access their own profile, or admins to access any user
    if (req.user.role === UserRole.ADMIN || req.user.id === +id) {
      const user = await this.userService.findOne(+id);
      return ApiResponseDto.success('User retrieved successfully', user);
    }
    throw new Error('Forbidden resource');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponseDto> {
    // Allow users to update their own profile, or admins to update any user
    if (req.user.role === UserRole.ADMIN || req.user.id === +id) {
      const user = await this.userService.update(+id, updateUserDto);
      return ApiResponseDto.success('User updated successfully', user);
    }
    throw new Error('Forbidden resource');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<ApiResponseDto> {
    await this.userService.remove(+id);
    return ApiResponseDto.success('User deleted successfully');
  }
}
