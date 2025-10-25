import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

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
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest): Promise<User> {
    return this.userService.getProfile(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<User> {
    // Allow users to access their own profile, or admins to access any user
    if (req.user.role === UserRole.ADMIN || req.user.id === +id) {
      return this.userService.findOne(+id);
    }
    throw new Error('Forbidden resource');
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
    @Request() req: AuthenticatedRequest
  ): Promise<User> {
    // Allow users to update their own profile, or admins to update any user
    if (req.user.role === UserRole.ADMIN || req.user.id === +id) {
      return this.userService.update(+id, updateUserDto);
    }
    throw new Error('Forbidden resource');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }
}
