import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../../../entities/verification-request.entity';

export class ReviewVerificationDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsString()
  adminComment?: string;
}
