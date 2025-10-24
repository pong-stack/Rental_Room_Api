import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateRoomRuleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  ruleTitle: string;

  @IsOptional()
  @IsString()
  ruleDescription?: string;
}
