import { IsString, IsNumber, IsPositive, Min, IsOptional, IsArray, IsEnum, IsInt } from 'class-validator';
import { AccommodationCategory } from '@prisma/client';

export class CreateAccommodationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsNumber()
  @IsPositive()
  pricePerNight: number;

  @IsInt()
  @Min(1)
  totalRooms: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsEnum(AccommodationCategory)
  category?: AccommodationCategory;
}
