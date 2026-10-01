import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TagCategoryEnum {
  CATEGORY = 'CATEGORY',
  AMENITY = 'AMENITY',
  ACTIVITY = 'ACTIVITY',
  LOCATION = 'LOCATION',
  TRIP_TYPE = 'TRIP_TYPE',
  VEHICLE_TYPE = 'VEHICLE_TYPE',
  OTHER = 'OTHER',
}

export enum RecommendationAudienceEnum {
  COUPLES = 'COUPLES',
  FAMILIES = 'FAMILIES',
  SOLO = 'SOLO',
  ADVENTURE = 'ADVENTURE',
  NATURE = 'NATURE',
  WEEKEND_GETAWAY = 'WEEKEND_GETAWAY',
  BUDGET = 'BUDGET',
  LUXURY = 'LUXURY',
  GENERAL = 'GENERAL',
}

export class CreateListingTagDto {
  @ApiProperty({ example: 'Safari Lodge', description: 'Name of the tag' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    enum: TagCategoryEnum,
    default: TagCategoryEnum.CATEGORY,
    description: 'Tag classification (CATEGORY, AMENITY, ACTIVITY, LOCATION, TRIP_TYPE, VEHICLE_TYPE, OTHER)',
  })
  @IsOptional()
  @IsEnum(TagCategoryEnum)
  category?: TagCategoryEnum;

  @ApiPropertyOptional({ example: 'pool', description: 'Optional icon identifier or emoji' })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class SetListingTagsDto {
  @ApiProperty({
    description: 'Array of tag objects or simple tag name strings',
    example: [
      { name: 'Safari Lodge', category: 'CATEGORY' },
      { name: 'Swimming Pool', category: 'AMENITY' },
      { name: 'Game Drive', category: 'ACTIVITY' },
      { name: 'Round Travel', category: 'TRIP_TYPE' },
      { name: 'Luxury Coach', category: 'VEHICLE_TYPE' },
    ],
  })
  @IsArray()
  tags: (string | CreateListingTagDto)[];
}

export class CreateListingRecommendationDto {
  @ApiPropertyOptional({
    enum: RecommendationAudienceEnum,
    default: RecommendationAudienceEnum.GENERAL,
    description: 'Target audience / theme for this recommendation',
  })
  @IsOptional()
  @IsEnum(RecommendationAudienceEnum)
  audience?: RecommendationAudienceEnum;

  @ApiProperty({
    example: 'Recommended for Honeymooners & Couples',
    description: 'Headline recommendation label',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Private plunge pool with stunning sunset views over the Zambezi River.',
    description: 'Why this listing is recommended',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    example: "Couples' Choice",
    description: 'Short promotional badge text',
  })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class SetListingRecommendationsDto {
  @ApiProperty({
    type: [CreateListingRecommendationDto],
    description: 'Array of recommendations for this listing',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingRecommendationDto)
  recommendations: CreateListingRecommendationDto[];
}

export class ListingFilterQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category tag slug or name' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by any tag name or slug' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Filter by activity tag (e.g. "Game Drive", "Rafting")' })
  @IsOptional()
  @IsString()
  activity?: string;

  @ApiPropertyOptional({ description: 'Filter by amenity tag (e.g. "WiFi", "AC", "Pool")' })
  @IsOptional()
  @IsString()
  amenity?: string;

  @ApiPropertyOptional({ description: 'Filter by location tag (e.g. "Livingstone", "Waterfront")' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Filter by trip type for buses/transport: ONE_WAY or ROUND_TRIP' })
  @IsOptional()
  @IsString()
  tripType?: string;

  @ApiPropertyOptional({ description: 'Filter by vehicle type for buses/transport: Luxury Coach, Minibus, etc.' })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({
    enum: RecommendationAudienceEnum,
    description: 'Filter by curated recommendation audience (e.g. COUPLES, FAMILIES, ADVENTURE)',
  })
  @IsOptional()
  @IsString()
  recommendation?: string;
}
