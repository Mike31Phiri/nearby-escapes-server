import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsInt, Min, Matches } from 'class-validator';

export class BlockDatesDto {
  @ApiPropertyOptional({ description: 'Property ID (master property)', example: 'uuid-prop-1' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ example: 'uuid-stay-1' })
  @IsOptional()
  @IsString()
  stayId?: string;

  @ApiPropertyOptional({ example: 'uuid-prop-1' })
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiPropertyOptional({ example: 'uuid-stay-1' })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Number of inventory units to block (default: all units)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Inclusive final blocked date', example: '2026-10-05' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Inclusive final blocked date', example: '2026-10-05' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Reason for blocking (e.g. Maintenance / Repairs)', example: 'Maintenance / Repairs' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Local check-in time in Africa/Lusaka (HH:mm)', example: '14:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  checkInTime?: string;

  @ApiPropertyOptional({ description: 'Local check-out time in Africa/Lusaka (HH:mm). Omit for manual-unblock maintenance blocks.', example: '10:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  checkOutTime?: string;
}

/** Rich response after blocking dates — matches spec blockedRangeId + echo */
export class BlockDatesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Generated block range ID', example: 'blk-9012' })
  blockedRangeId: string;

  @ApiProperty({ example: 'uuid-prop-1' })
  listingId: string;

  @ApiProperty({ example: '2026-10-01' })
  startDate: string;

  @ApiProperty({ description: 'Inclusive final blocked date', example: '2026-10-05' })
  endDate: string;

  @ApiPropertyOptional({ example: 'Maintenance / Repairs' })
  reason?: string;

  @ApiPropertyOptional({ description: 'Scheduled local check-in instant, returned as UTC ISO-8601' })
  checkInAt?: string;

  @ApiPropertyOptional({ description: 'Scheduled local check-out instant, returned as UTC ISO-8601' })
  checkOutAt?: string;
}

export class UnblockDatesDto {
  @ApiPropertyOptional({ description: 'Property ID (inventory identifier)', example: 'uuid-prop-1' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Listing property ID (alias for propertyId)', example: 'uuid-prop-1' })
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)', example: '2026-10-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)', example: '2026-10-05' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Optional specific unit ID', example: 'uuid-stay-1' })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Number of inventory units to unblock (default: all)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;
}

export class UnblockDatesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional({ example: 'Dates unblocked successfully.' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class ExperienceSlotBlockDto {
  @ApiPropertyOptional({ description: 'Property ID or Experience ID', example: 'uuid-prop-1' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ example: 'uuid-exp-1' })
  @IsOptional()
  @IsString()
  experienceId?: string;

  @ApiProperty({ description: 'Target date (YYYY-MM-DD)', example: '2026-10-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Time slot string (e.g. 09:00 AM or 14:00)', example: '09:00 AM' })
  @IsString()
  slot: string;
}

export class ExperienceSlotActionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Slot 09:00 AM blocked for 2026-10-01' })
  message: string;
}


export class ExperienceAvailabilityQueryDto {
  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  date: string;
}

export class TransportAvailabilityQueryDto {
  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  date: string;
}
