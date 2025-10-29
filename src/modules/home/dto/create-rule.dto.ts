import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  ruleTitle: string;

  @IsOptional()
  @IsString()
  ruleDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
