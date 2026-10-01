import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetHostBookingsQueryDto {
  @ApiPropertyOptional({ enum: ['confirmed', 'cancelled', 'completed'] })
  @IsOptional()
  @IsIn(['confirmed', 'cancelled', 'completed'])
  status?: 'confirmed' | 'cancelled' | 'completed';

  @ApiPropertyOptional({ description: 'Filter by listing ID' })
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiPropertyOptional({ description: 'Page number (default 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page (default 20)', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class HostBookingListItemDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'NE-2026-8945' })
  bookingRef: string;

  @ApiProperty({ example: 'uuid-prop-1' })
  listingId: string;

  @ApiProperty({ example: 'Zambezi Riverfront Villa' })
  listingTitle: string;

  @ApiProperty({ enum: ['stay', 'experience', 'transport'], example: 'stay' })
  vertical: 'stay' | 'experience' | 'transport';

  @ApiProperty({ enum: ['confirmed', 'cancelled', 'completed'], example: 'confirmed' })
  status: 'confirmed' | 'cancelled' | 'completed';

  @ApiProperty({ description: 'Check-in date (YYYY-MM-DD)', example: '2026-10-01', nullable: true })
  checkIn: string | null;

  @ApiProperty({ description: 'Check-out date (YYYY-MM-DD)', example: '2026-10-05', nullable: true })
  checkOut: string | null;

  @ApiProperty({ description: 'Activity/transport date (YYYY-MM-DD)', example: '2026-10-01', nullable: true })
  date: string | null;

  @ApiProperty({ example: 2 })
  guests: number;

  @ApiProperty({ description: 'Total price in Ngwee', example: 4500000 })
  totalNgwee: number;

  @ApiProperty({ example: 'John Banda' })
  guestName: string;

  @ApiProperty({ example: '+260971234567' })
  guestPhone: string;

  @ApiProperty({ example: '2026-09-30T14:30:00.000Z' })
  createdAt: string;
}
