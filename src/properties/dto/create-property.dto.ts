import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsInt, Min } from 'class-validator';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Victoria Falls Safari Lodge' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Stunning lodge overlooking the waterhole', default: '' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Livingstone, Zambia', default: '' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.STAY })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: 'Set to true to save as draft (Save & Exit)', default: false })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @ApiPropertyOptional({ description: 'Current step in wizard when saved as draft (e.g. 1, 2, 3)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  draftStep?: number;

  @ApiPropertyOptional({ description: 'Arbitrary in-progress draft JSON data for frontend state restoration' })
  @IsOptional()
  draftData?: any;

  @ApiPropertyOptional({ example: 'ZMW', default: 'ZMW' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://example.com/img1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String], example: ['WiFi', 'Pool'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ type: [String], example: ['No smoking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @ApiPropertyOptional({ description: 'Listing tags (strings or { name, category })' })
  @IsOptional()
  @IsArray()
  tags?: any[];

  @ApiPropertyOptional({ description: 'Curated recommendations ({ audience, title, reason })' })
  @IsOptional()
  @IsArray()
  recommendations?: any[];
}
