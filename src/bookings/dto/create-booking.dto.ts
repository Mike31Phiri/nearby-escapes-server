import { IsString, IsOptional, IsInt, Min, IsDateString, IsIn } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  listingId: string;

  @IsString()
  @IsIn(['stay', 'experience', 'transport'])
  listingType: string;

  // For stays
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  // For stays
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  // For experiences / transport
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsInt()
  @Min(1)
  guests: number;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
