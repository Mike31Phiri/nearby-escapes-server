import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HostScheduleItemDTO {
  @ApiProperty({ description: 'Booking ID', example: 'uuid-1234' })
  id: string;

  @ApiProperty({ enum: ['arriving', 'hosting', 'departing'], example: 'arriving' })
  type: 'arriving' | 'hosting' | 'departing';

  @ApiProperty({ enum: ['stay', 'experience', 'transport'], example: 'stay' })
  listingType: 'stay' | 'experience' | 'transport';

  @ApiProperty({ description: 'Booking reference code', example: 'NE-2026-8945' })
  bookingRef: string;

  @ApiProperty({ description: 'Guest full name', example: 'Jane Doe' })
  guestName: string;

  @ApiProperty({ description: 'Guest contact phone', example: '+260971234567' })
  guestPhone: string;

  @ApiProperty({ description: 'Guest email address', example: 'jane@example.com' })
  guestEmail: string;

  @ApiPropertyOptional({ description: 'Guest avatar URL', example: 'https://images.unsplash.com/...' })
  guestAvatar?: string;

  @ApiProperty({ description: 'Listing property ID', example: 'uuid-prop-1' })
  listingId: string;

  @ApiProperty({ description: 'Listing name / title', example: 'Zambezi Riverfront Villa' })
  listingName: string;

  @ApiProperty({ description: 'Listing primary image URL', example: 'https://images.unsplash.com/...' })
  listingImage: string;

  @ApiProperty({ description: 'Check-in or activity date (YYYY-MM-DD)', example: '2026-09-30' })
  checkInDate: string;

  @ApiPropertyOptional({ description: 'Check-out date for stays (YYYY-MM-DD)', example: '2026-10-04' })
  checkOutDate?: string;

  @ApiPropertyOptional({ description: 'Time slot for experiences/transports', example: '08:30 AM' })
  timeSlot?: string;

  @ApiPropertyOptional({ description: 'Stay progress summary', example: 'Night 2 of 4' })
  stayProgress?: string;

  @ApiProperty({ description: 'Total number of guests', example: 2 })
  guestCount: number;

  @ApiProperty({ description: 'Total amount in Ngwee', example: 450000 })
  totalAmountNgwee: number;

  @ApiProperty({ enum: ['ZMW', 'USD'], example: 'ZMW' })
  currency: 'ZMW' | 'USD';

  @ApiProperty({ enum: ['confirmed', 'checked_in', 'checked_out'], example: 'confirmed' })
  status: 'confirmed' | 'checked_in' | 'checked_out';
}

export class HostScheduleTodayDto {
  @ApiProperty({ type: [HostScheduleItemDTO] })
  arriving: HostScheduleItemDTO[];

  @ApiProperty({ type: [HostScheduleItemDTO] })
  hosting: HostScheduleItemDTO[];

  @ApiProperty({ type: [HostScheduleItemDTO] })
  departing: HostScheduleItemDTO[];
}

export class HostCheckInResponseDto {
  @ApiProperty({ description: 'Booking reference code', example: 'NE-2026-8945' })
  bookingRef: string;

  @ApiProperty({ example: 'checked_in' })
  status: 'checked_in';

  @ApiProperty({ description: 'ISO 8601 timestamp of check-in', example: '2026-09-30T14:30:00.000Z' })
  checkInTimestamp: string;
}

export class HostCheckOutResponseDto {
  @ApiProperty({ description: 'Booking reference code', example: 'NE-2026-8945' })
  bookingRef: string;

  @ApiProperty({ example: 'checked_out' })
  status: 'checked_out';

  @ApiProperty({ description: 'ISO 8601 timestamp of check-out', example: '2026-09-30T10:15:00.000Z' })
  checkOutTimestamp: string;
}
