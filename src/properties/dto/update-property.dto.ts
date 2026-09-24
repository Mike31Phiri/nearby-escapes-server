import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PropertyStatus } from '@prisma/client';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsString()
  currency?: string;
}
