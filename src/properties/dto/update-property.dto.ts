import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, IsArray } from 'class-validator';
import { PropertyStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePropertyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: 'Mark whether this listing is a draft' })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({ description: 'Wizard step saved at' })
  @IsOptional()
  @IsInt()
  @Min(1)
  draftStep?: number;

  @ApiPropertyOptional({ description: 'JSON draft data' })
  @IsOptional()
  draftData?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  recommendations?: any[];
}

export class UpdatePropertyPricingDto {
  @ApiPropertyOptional({ description: 'New price per unit in Ngwee (e.g. 4500000 = ZMW 4,500.00)', example: 4500000 })
  @IsInt()
  @Min(0)
  pricePerUnitNgwee: number;

  @ApiPropertyOptional({ enum: ['ZMW', 'USD'], example: 'ZMW' })
  @IsOptional()
  @IsString()
  currency?: 'ZMW' | 'USD';
}

export class UpdatePropertyPricingResponseDto {
  @ApiProperty({ example: 'uuid-prop-1' })
  propertyId: string;

  @ApiProperty({ example: 'Mukuni Chalet' })
  propertyName: string;

  @ApiProperty({ example: 4500000 })
  pricePerUnitNgwee: number;

  @ApiProperty({ example: 'ZMW' })
  currency: string;

  @ApiProperty({ description: 'Confirms that historical past bookings remain unchanged', example: true })
  historicalBookingsPreserved: boolean;

  @ApiProperty({ example: '2026-09-30T18:30:00.000Z' })
  updatedAt: string;
}

