import { IsString, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class BlockDatesDto {
  @IsOptional()
  @IsString()
  stayId?: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;
}

export class SeasonalPricingDto {
  @IsOptional()
  @IsString()
  stayId?: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  label?: string;
}

export class ExperienceAvailabilityQueryDto {
  @IsDateString()
  date: string;
}

export class TransportAvailabilityQueryDto {
  @IsDateString()
  date: string;
}
