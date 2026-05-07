import {
  IsDateString, IsEmail, IsInt, IsOptional,
  IsString, IsUUID, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GuestInfoDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class CreateBookingDto {
  @IsUUID()
  stayId: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsInt()
  @Min(1)
  guests: number;

  @ValidateNested()
  @Type(() => GuestInfoDto)
  guestInfo: GuestInfoDto;
}
