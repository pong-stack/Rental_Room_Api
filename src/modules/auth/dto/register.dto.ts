import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // Note: 'role' field removed. All users register as 'user' by default.
  // To become 'home_owner', use the role upgrade request system: POST /role-upgrade/request
}
