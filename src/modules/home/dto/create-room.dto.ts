import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsUrl,
  IsArray,
  IsInt,
} from 'class-validator';

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
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ruleIds?: number[];

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
