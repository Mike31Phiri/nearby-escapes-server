import { IsString, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class BlockDatesDto {
  @IsString()
  listingId: string;

  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;
}

export class SeasonalPricingDto {
  @IsString()
  listingId: string;

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
