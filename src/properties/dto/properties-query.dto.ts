import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';

export class PropertiesQueryDto {
  @IsOptional()
  @IsString()
  type?: string; // stay | experience | transport | all

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string; // price_asc | price_desc | rating | newest

  @IsOptional()
  @IsString()
  @IsIn(['gem', 'packages'])
  featured?: string; // gem | packages

  @IsOptional()
  @IsString()
  q?: string;
}

// Backwards compatibility alias
export const ListingsQueryDto = PropertiesQueryDto;
