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
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  images?: string[];
}
