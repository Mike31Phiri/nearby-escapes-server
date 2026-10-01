import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PropertiesQueryDto {
  @IsOptional()
  @IsString()
  type?: string; // stay | experience | transport | all

  @IsOptional()
  @IsString()
  vertical?: string; // Frontend alias for type (stay | experience | transport | package | all)

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPriceNgwee?: number; // Frontend alias in integer Ngwee

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPriceNgwee?: number; // Frontend alias in integer Ngwee

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsString()
  amenities?: string; // comma-separated: wifi,pool,solar_power

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  sort?: string; // price_asc | price_desc | rating | popular | newest

  @IsOptional()
  @IsString()
  @IsIn(['gem', 'packages'])
  featured?: string; // gem | packages

  @IsOptional()
  @IsString()
  q?: string;

  // Transport route search parameters
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  trip?: string; // one_way | round_trip

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  passengers?: number;
}

// Backwards compatibility alias
export const ListingsQueryDto = PropertiesQueryDto;
