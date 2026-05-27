import { IsString, IsInt, IsOptional, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ListingDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: string; // stay | experience | transport
}

export class BookingDetailsDto {
  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsInt()
  guests: number;
}

export class CreateTokenDto {
  @IsString()
  bookingRef: string;

  @IsInt()
  amount: number;

  @IsOptional()
  @IsString()
  currency: string = 'ZMW';

  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ValidateNested()
  @Type(() => ListingDto)
  listing: ListingDto;

  @ValidateNested()
  @Type(() => BookingDetailsDto)
  details: BookingDetailsDto;

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}
