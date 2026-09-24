import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PolicyTypeEnum {
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  CANCELLATION = 'CANCELLATION',
  REFUND_POLICY = 'REFUND_POLICY',
  HOST_STANDARDS = 'HOST_STANDARDS',
  GUEST_STANDARDS = 'GUEST_STANDARDS',
  TRUST_SAFETY = 'TRUST_SAFETY',
  OTHER = 'OTHER',
}

export class CreatePolicyDto {
  @ApiProperty({ description: 'URL-friendly unique identifier', example: 'cancellation-moderate' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug: string;

  @ApiProperty({ description: 'Display title of the policy', example: 'Moderate Cancellation Policy' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: PolicyTypeEnum, example: PolicyTypeEnum.CANCELLATION })
  @IsEnum(PolicyTypeEnum)
  type: PolicyTypeEnum;

  @ApiPropertyOptional({ description: 'Short summary or subtitle of policy' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Full text or markdown content of initial version' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Initial version string', example: '1.0.0', default: '1.0.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ description: 'Changelog / version summary' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Direct URL to PDF or legal document in S3' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ description: 'Structured JSON rules/metadata (e.g. refund tiers)' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Effective date ISO timestamp' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Whether policy is live/published', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdatePolicyDto {
  @ApiPropertyOptional({ description: 'Display title of the policy' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: PolicyTypeEnum })
  @IsOptional()
  @IsEnum(PolicyTypeEnum)
  type?: PolicyTypeEnum;

  @ApiPropertyOptional({ description: 'Short summary or subtitle of policy' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether policy is live/published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreatePolicyVersionDto {
  @ApiProperty({ description: 'New version string', example: '1.1.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'Full text or markdown content for this version' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Change notes for this version' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Direct URL to PDF or legal document in S3' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ description: 'Structured JSON rules/metadata' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Effective date ISO timestamp' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Promote this version to currentVersion on the policy', default: true })
  @IsOptional()
  @IsBoolean()
  setAsCurrent?: boolean;
}
