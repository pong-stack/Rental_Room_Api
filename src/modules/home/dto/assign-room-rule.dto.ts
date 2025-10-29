import { IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class AssignRoomRuleDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  ruleId: number;
}
