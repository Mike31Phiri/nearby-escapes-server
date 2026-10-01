import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class HostCancelReservationDto {
  @ApiPropertyOptional({ description: 'Optional booking reference', example: 'NE-2026-8945' })
  @IsOptional()
  @IsString()
  bookingRef?: string;

  @ApiPropertyOptional({ description: 'Optional cancellation reason', example: 'Unforeseen maintenance emergency' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'host' })
  @IsOptional()
  @IsString()
  cancelledBy?: 'host';
}

export class HostCancelReservationResponseDto {
  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  bookingId: string;

  @ApiProperty({ example: 'NE-2026-8945' })
  bookingRef: string;

  @ApiProperty({ example: 'cancelled' })
  status: 'cancelled';

  @ApiProperty({ description: 'Indicates whether the booked inventory/calendar slots were reopened', example: true })
  inventoryReopened: boolean;

  @ApiProperty({ description: 'Full refund amount to guest in Ngwee', example: 4500000 })
  refundAmountNgwee: number;

  @ApiProperty({ description: 'Host penalty fee if applicable in Ngwee', example: 0 })
  penaltyFeeNgwee: number;

  @ApiProperty({ example: '2026-09-30T15:30:00.000Z' })
  cancellationDate: string;
}

