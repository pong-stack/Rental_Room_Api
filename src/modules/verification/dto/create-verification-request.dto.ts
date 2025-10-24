import { IsNumber, IsPositive } from 'class-validator';

export class CreateVerificationRequestDto {
  @IsNumber()
  @IsPositive()
  homeId: number;
}
