import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInvoiceItemDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
