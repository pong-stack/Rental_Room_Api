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

export class CreateRoomDto {
  @IsNumber()
  @IsInt()
  homeId: number;

  @IsString()
  roomName: string;

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
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ruleIds?: number[];
}
