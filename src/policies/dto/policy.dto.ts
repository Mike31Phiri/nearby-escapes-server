import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type PolicyStatus = 'draft' | 'published' | 'archived';

export type PolicyCategory =
  | 'legal'              // Terms of Service, Privacy, Cookies
  | 'guest_protection'  // Guest Refund Policy, Booking Guarantees
  | 'host_standards'    // Host Quality Standards, Payout Terms
  | 'safety_security'   // Safety Guidelines, Prohibited Items
  | 'fee_structure';    // Service Fees & Commission Schedules

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
  @ApiProperty({ description: 'URL-friendly unique identifier', example: 'guest-refund-policy' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'Display title of the policy', example: 'Guest Refund & Extenuating Circumstances Policy' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ enum: PolicyTypeEnum, example: PolicyTypeEnum.REFUND_POLICY })
  @IsOptional()
  type?: PolicyTypeEnum | string;

  @ApiPropertyOptional({ description: 'Category e.g. guest_protection, legal, host_standards, safety_security, fee_structure' })
  @IsOptional()
  @IsString()
  category?: PolicyCategory | string;

  @ApiPropertyOptional({ description: 'Short summary or subtitle of policy' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Full text or markdown content of initial version' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Markdown content for policy' })
  @IsOptional()
  @IsString()
  contentMarkdown?: string;

  @ApiPropertyOptional({ description: 'Initial version string', example: '2.0.0', default: '1.0.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ description: 'Status: draft | published | archived' })
  @IsOptional()
  @IsString()
  status?: PolicyStatus | string;

  @ApiPropertyOptional({ description: 'Changelog / version summary' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Changelog / summary of changes' })
  @IsOptional()
  @IsString()
  summaryOfChanges?: string;

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
  type?: PolicyTypeEnum | string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: PolicyCategory | string;

  @ApiPropertyOptional({ description: 'Short summary or subtitle of policy' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether policy is live/published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Status: draft | published | archived' })
  @IsOptional()
  @IsString()
  status?: PolicyStatus | string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summaryOfChanges?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentMarkdown?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}

export class CreatePolicyVersionDto {
  @ApiProperty({ description: 'New version string', example: '1.1.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiPropertyOptional({ description: 'Full text or markdown content for this version' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Markdown content for this version' })
  @IsOptional()
  @IsString()
  contentMarkdown?: string;

  @ApiPropertyOptional({ description: 'Change notes for this version' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Changelog / summary of changes' })
  @IsOptional()
  @IsString()
  summaryOfChanges?: string;

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

// -------------------------------------------------------------
// Host & Property Policies DTOs
// -------------------------------------------------------------

export type CancellationTier = 'flexible' | 'moderate' | 'strict' | 'custom';

export class PropertyCancellationPolicyDto {
  @ApiProperty({ enum: ['flexible', 'moderate', 'strict', 'custom'], example: 'moderate' })
  @IsString()
  tier: CancellationTier;

  @ApiPropertyOptional({ example: 'Full refund up to 5 days before check-in.' })
  @IsOptional()
  @IsString()
  customText?: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  freeCancellationCutOffHours: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  refundPercentagePriorToCutOff: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  refundPercentageAfterCutOff: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  nonRefundableDiscountAvailable: boolean;
}

export class PropertySchedulePolicyDto {
  @ApiProperty({ example: '14:00' })
  @IsString()
  checkInFrom: string;

  @ApiProperty({ example: '21:00' })
  @IsString()
  checkInUntil: string;

  @ApiProperty({ example: '10:30' })
  @IsString()
  checkOutBefore: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  selfCheckInAllowed: boolean;

  @ApiPropertyOptional({ example: 'keypad' })
  @IsOptional()
  @IsString()
  selfCheckInMethod?: 'smart_lock' | 'keypad' | 'lockbox' | 'front_desk' | 'host_greeter' | string;
}

export class PropertyQuietHoursDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: '22:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '06:30' })
  @IsString()
  endTime: string;
}

export class PropertyHouseRulesDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  smokingAllowed: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  petsAllowed: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  partiesOrEventsAllowed: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  commercialPhotographyAllowed: boolean;

  @ApiProperty({ type: PropertyQuietHoursDto })
  @ValidateNested()
  @Type(() => PropertyQuietHoursDto)
  quietHours: PropertyQuietHoursDto;

  @ApiProperty({ example: 4 })
  @IsNumber()
  maxGuests: number;

  @ApiProperty({ example: 18 })
  @IsNumber()
  minAgeRequirement: number;

  @ApiProperty({ type: [String], example: ['Extinguish braai fires before bed'] })
  @IsArray()
  customRules: string[];
}

export class PropertySecurityDepositDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ example: 75000 })
  @IsNumber()
  amountNgwee: number;

  @ApiProperty({ example: 'ZMW' })
  @IsString()
  currency: 'ZMW' | 'USD' | string;

  @ApiProperty({ example: 48 })
  @IsNumber()
  refundTimelineHours: number;
}

export class PropertySafetyDevicesDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  smokeAlarm: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  carbonMonoxideAlarm: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  firstAidKit: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  fireExtinguisher: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  securityCamerasOnProperty: boolean;

  @ApiPropertyOptional({ example: 'Exterior perimeter fence only' })
  @IsOptional()
  @IsString()
  cameraLocations?: string;
}

export class PropertyGoodToKnowDto {
  @ApiProperty({ example: 'Lodge operates on 24-hour solar inverter.' })
  @IsString()
  customPoliciesText: string;

  @ApiProperty({ type: PropertySafetyDevicesDto })
  @ValidateNested()
  @Type(() => PropertySafetyDevicesDto)
  safetyDevices: PropertySafetyDevicesDto;
}

export class UpdatePropertyPoliciesDto {
  @ApiProperty({ type: PropertyCancellationPolicyDto })
  @ValidateNested()
  @Type(() => PropertyCancellationPolicyDto)
  cancellation: PropertyCancellationPolicyDto;

  @ApiProperty({ type: PropertySchedulePolicyDto })
  @ValidateNested()
  @Type(() => PropertySchedulePolicyDto)
  schedule: PropertySchedulePolicyDto;

  @ApiProperty({ type: PropertyHouseRulesDto })
  @ValidateNested()
  @Type(() => PropertyHouseRulesDto)
  houseRules: PropertyHouseRulesDto;

  @ApiProperty({ type: PropertySecurityDepositDto })
  @ValidateNested()
  @Type(() => PropertySecurityDepositDto)
  securityDeposit: PropertySecurityDepositDto;

  @ApiProperty({ type: PropertyGoodToKnowDto })
  @ValidateNested()
  @Type(() => PropertyGoodToKnowDto)
  goodToKnow: PropertyGoodToKnowDto;
}
