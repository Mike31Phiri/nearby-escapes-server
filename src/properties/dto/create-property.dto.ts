import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];
}
