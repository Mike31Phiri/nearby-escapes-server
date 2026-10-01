import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ListingPolicyCategoryEnum {
  CANCELLATION = 'CANCELLATION',
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  HOUSE_RULES = 'HOUSE_RULES',
  SAFETY = 'SAFETY',
  PET_POLICY = 'PET_POLICY',
  CHILD_POLICY = 'CHILD_POLICY',
  NOISE_POLICY = 'NOISE_POLICY',
  SMOKING_POLICY = 'SMOKING_POLICY',
  REFUND = 'REFUND',
  DAMAGE = 'DAMAGE',
  OTHER = 'OTHER',
}

export class CreateListingPolicyDto {
  @ApiProperty({ enum: ListingPolicyCategoryEnum, example: 'HOUSE_RULES' })
  @IsEnum(ListingPolicyCategoryEnum)
  category: ListingPolicyCategoryEnum;

  @ApiProperty({ example: 'No smoking indoors' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Smoking is strictly not permitted inside any of the rooms or chalets.' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateListingPolicyDto {
  @ApiPropertyOptional({ enum: ListingPolicyCategoryEnum })
  @IsOptional()
  @IsEnum(ListingPolicyCategoryEnum)
  category?: ListingPolicyCategoryEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

/**
 * Used when the host sends a full replacement of all policies for a unit
 * (PUT semantics — replaces the whole set in one shot).
 */
export class SetListingPoliciesDto {
  @ApiProperty({ type: [CreateListingPolicyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingPolicyDto)
  policies: CreateListingPolicyDto[];
}
