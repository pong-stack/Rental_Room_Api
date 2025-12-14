import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsUrl,
  IsArray,
  IsInt,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateRoomDto {
  @Type(() => Number)
  @IsNumber()
  @IsInt()
  homeId: number;

  @IsString()
  roomName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsInt()
  ruleId?: number;
}
