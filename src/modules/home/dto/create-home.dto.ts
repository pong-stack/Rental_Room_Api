import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsUrl,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  image_urls?: string[];

  // Keep individual image fields for backward compatibility
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
