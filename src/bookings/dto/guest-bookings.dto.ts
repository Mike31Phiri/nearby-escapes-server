import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestBookingItemDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'NE-2026-8945' })
  bookingRef: string;

  @ApiProperty({ example: 'uuid-prop-1' })
  listingId: string;

  @ApiProperty({ example: 'Zambezi Riverfront Villa' })
  listingTitle: string;

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  listingImage: string;

  @ApiProperty({ example: 'Livingstone, Zambia' })
  location: string;

  @ApiProperty({ enum: ['stay', 'experience', 'transport'], example: 'stay' })
  vertical: 'stay' | 'experience' | 'transport';

  @ApiProperty({
    enum: ['confirmed', 'checked_in', 'completed', 'cancelled', 'pending'],
    example: 'confirmed',
  })
  status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'pending';

  @ApiProperty({
    enum: ['upcoming', 'active', 'recent', 'cancelled'],
    example: 'upcoming',
  })
  category: 'upcoming' | 'active' | 'recent' | 'cancelled';

  @ApiPropertyOptional({ example: '2026-10-01', nullable: true })
  checkInDate: string | null;

  @ApiPropertyOptional({ example: '2026-10-05', nullable: true })
  checkOutDate: string | null;

  @ApiPropertyOptional({ example: '2026-10-01', nullable: true })
  date: string | null;

  @ApiPropertyOptional({ example: '09:00', nullable: true })
  timeSlot: string | null;

  @ApiPropertyOptional({ example: 4 })
  nightsCount?: number;

  @ApiPropertyOptional({ example: 'Night 1 of 4' })
  stayProgress?: string;

  @ApiProperty({ example: 2 })
  guestsCount: number;

  @ApiProperty({ description: 'Total price in Ngwee', example: 4500000 })
  totalNgwee: number;

  @ApiProperty({ example: 'K45,000.00' })
  totalFormatted: string;

  @ApiProperty({ enum: ['ZMW', 'USD'], example: 'ZMW' })
  currency: 'ZMW' | 'USD';

  @ApiProperty({ enum: ['paid', 'unpaid', 'refunded'], example: 'paid' })
  paymentStatus: 'paid' | 'unpaid' | 'refunded';

  @ApiProperty({ example: 'Chileshe Kapwepwe' })
  hostName: string;

  @ApiPropertyOptional({ example: '+260971234567' })
  hostPhone?: string;

  @ApiProperty({ example: '2026-09-30T14:30:00.000Z' })
  createdAt: string;
}

export class GuestBookingsStatsDto {
  @ApiProperty({ example: 5 })
  totalBookingsCount: number;

  @ApiProperty({ example: 2 })
  upcomingCount: number;

  @ApiProperty({ example: 1 })
  activeCount: number;

  @ApiProperty({ example: 2 })
  recentCount: number;
}

export class GuestBookingsGroupedDto {
  @ApiProperty({ type: [GuestBookingItemDto] })
  upcoming: GuestBookingItemDto[];

  @ApiProperty({ type: [GuestBookingItemDto] })
  active: GuestBookingItemDto[];

  @ApiProperty({ type: [GuestBookingItemDto] })
  recent: GuestBookingItemDto[];

  @ApiProperty({ type: [GuestBookingItemDto] })
  cancelled: GuestBookingItemDto[];

  @ApiProperty({ type: GuestBookingsStatsDto })
  stats: GuestBookingsStatsDto;
}

export class GetGuestBookingsQueryDto {
  @ApiPropertyOptional({
    enum: ['upcoming', 'active', 'recent', 'cancelled', 'all'],
    description: 'Filter bookings by travel category',
  })
  @IsOptional()
  @IsIn(['upcoming', 'active', 'recent', 'cancelled', 'all'])
  category?: 'upcoming' | 'active' | 'recent' | 'cancelled' | 'all';

  @ApiPropertyOptional({ description: 'Optional explicit user ID to fetch bookings for' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
