import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class CreateRoleUpgradeRequestDto {
  @IsEnum(UserRole)
  requestedRole: UserRole;

  @IsOptional()
  @IsString()
  reason?: string;
}
