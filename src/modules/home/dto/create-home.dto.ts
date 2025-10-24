import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  description?: string;
}
