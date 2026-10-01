import { IsString, IsOptional, IsInt, Min, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CancellationPolicy } from '@prisma/client';
import { CreateListingPolicyDto } from './listing-policy.dto';


export class CreateStayDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price: number; // in Ngwee

  @IsOptional()
  @IsString()
  roomType?: string; // "Suite", "Chalet", "Standard", "Family"

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  beds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  baths?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsString()
  checkInFrom?: string;

  @IsOptional()
  @IsString()
  checkInUntil?: string;

  @IsOptional()
  @IsString()
  checkOutBefore?: string;

  @IsOptional()
  @IsEnum(CancellationPolicy)
  cancellationPolicy?: CancellationPolicy;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingPolicyDto)
  policies?: CreateListingPolicyDto[];

  @IsOptional()
  @IsArray()
  tags?: any[];

  @IsOptional()
  @IsArray()
  recommendations?: any[];
}

export class UpdateStayDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  beds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  baths?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsString()
  checkInFrom?: string;

  @IsOptional()
  @IsString()
  checkInUntil?: string;

  @IsOptional()
  @IsString()
  checkOutBefore?: string;

  @IsOptional()
  @IsEnum(CancellationPolicy)
  cancellationPolicy?: CancellationPolicy;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
