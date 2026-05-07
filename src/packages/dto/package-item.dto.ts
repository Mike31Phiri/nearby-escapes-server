import { BookingType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class PackageItemDto {
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
}
