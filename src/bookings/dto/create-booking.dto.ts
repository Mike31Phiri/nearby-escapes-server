import { IsString, IsOptional, IsInt, Min, IsDateString, IsIn } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  listingId?: string; // backwards compatibility

  @IsOptional()
  @IsString()
  stayId?: string;

  @IsOptional()
  @IsString()
  experienceId?: string;

  @IsOptional()
  @IsString()
  transportId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['stay', 'experience', 'transport'])
  listingType?: string;

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

  // For experiences / transport time slot (e.g. "09:00", "14:00")
  @IsOptional()
  @IsString()
  timeSlot?: string;

  @IsInt()
  @Min(1)
  guests: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

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
