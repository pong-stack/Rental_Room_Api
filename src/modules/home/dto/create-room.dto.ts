import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsUrl } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsUrl()
  image1?: string;

  @IsOptional()
  @IsUrl()
  image2?: string;

  @IsOptional()
  @IsUrl()
  image3?: string;

  @IsOptional()
  @IsUrl()
  image4?: string;
}
