import { IsString, IsNumber, IsPositive, Min, IsOptional, IsEnum, IsArray, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccommodationCategory, CancellationPolicy } from '@prisma/client';

export class UpdateAccommodationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsNumber() @IsPositive() pricePerNight?: number;
  @IsOptional() @IsNumber() @Min(1) totalRooms?: number;
  @IsOptional() @IsNumber() @Min(0) availableRooms?: number;
  @IsOptional() @IsInt() @Min(1) maxGuests?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];
  @IsOptional() @IsEnum(AccommodationCategory) category?: AccommodationCategory;
  @ApiPropertyOptional({ enum: CancellationPolicy })
  @IsOptional() @IsEnum(CancellationPolicy) cancellationPolicy?: CancellationPolicy;
}
