import { BookingType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class BookingItemDto {
  @IsEnum(BookingType)
  itemType: BookingType;

  @IsOptional()
  @IsString()
  accommodationId?: string;

  @IsOptional()
  @IsString()
  busId?: string;

  @IsOptional()
  @IsString()
  attractionId?: string;

  @IsOptional()
  @IsString()
  packageId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
