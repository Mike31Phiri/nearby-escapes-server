import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StayUnitItemDto {
  @ApiPropertyOptional({ example: 'unit-1' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Chalet 1' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'King Room' })
  @IsString()
  type: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  maxGuests: number;
}

export class StayDetailsDto {
  @ApiProperty({ example: 'Lodge' })
  @IsString()
  propertyType: string;

  @ApiPropertyOptional({ description: 'Total inventory count (e.g. 15 chalets)', example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  inventoryCount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  bedrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  beds?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  baths?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  maxGuests?: number;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  checkInFrom?: string;

  @ApiPropertyOptional({ example: '20:00' })
  @IsOptional()
  @IsString()
  checkInUntil?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional()
  @IsString()
  checkOutBefore?: string;

  @ApiPropertyOptional({ type: [String], example: ['Pool', 'River view'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  guestFavourites?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Infinity Pool'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  standoutAmenities?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Smoke alarm', 'First aid kit'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyAmenities?: string[];

  @ApiPropertyOptional({ type: [StayUnitItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StayUnitItemDto)
  units?: StayUnitItemDto[];
}

export class ExperienceTimeSlotItemDto {
  @ApiPropertyOptional({ example: 'slot-1' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: 'Morning Departure' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: '08:30 AM' })
  @IsString()
  timeSlot: string;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  capacity: number;
}

export class ExperienceDetailsDto {
  @ApiProperty({ example: 'Safari & Wildlife' })
  @IsString()
  activityType: string;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  maxParticipants?: number;

  @ApiPropertyOptional({ enum: ['easy', 'moderate', 'challenging'], example: 'moderate' })
  @IsOptional()
  @IsIn(['easy', 'moderate', 'challenging'])
  difficulty?: 'easy' | 'moderate' | 'challenging';

  @ApiProperty({ type: [String], example: ['Professional Guide', 'Bottled Water'] })
  @IsArray()
  @IsString({ each: true })
  whatsIncluded: string[];

  @ApiPropertyOptional({ type: [String], example: ['Sunscreen', 'Hat'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatToBring?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Drones'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatNotToBring?: string[];

  @ApiPropertyOptional({ example: 'Livingstone Harbor Gate 2' })
  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @ApiPropertyOptional({ type: [ExperienceTimeSlotItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceTimeSlotItemDto)
  timeSlots?: ExperienceTimeSlotItemDto[];
}

export class TransportFleetUnitItemDto {
  @ApiPropertyOptional({ example: 'fleet-1' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Vehicle 1' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ example: 'ABC 1234' })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiProperty({ example: 14 })
  @IsInt()
  @Min(1)
  seats: number;
}

export class TransportDetailsDto {
  @ApiProperty({ example: 'Minibus / Shuttle' })
  @IsString()
  vehicleType: string;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  seatingCapacity?: number;

  @ApiPropertyOptional({ example: 'Kenneth Kaunda International Airport' })
  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @ApiPropertyOptional({ example: 'Lusaka City Centre' })
  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includesDriver?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['Air Conditioning', 'Luggage Space'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ type: [String], example: ['ID / Passport'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatToBring?: string[];

  @ApiPropertyOptional({ type: [String], example: ['No smoking inside vehicle'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  guidelines?: string[];

  @ApiPropertyOptional({ type: [TransportFleetUnitItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransportFleetUnitItemDto)
  fleetUnits?: TransportFleetUnitItemDto[];
}

export class CreateUnifiedListingDto {
  @ApiProperty({ enum: ['stay', 'experience', 'transport'], example: 'stay' })
  @IsIn(['stay', 'experience', 'transport'])
  vertical: 'stay' | 'experience' | 'transport';

  @ApiPropertyOptional({ description: 'Total inventory count (e.g. 15 chalets for Mukuni Chalet)', example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  inventoryCount?: number;

  @ApiProperty({ example: 'Luxury Zambezi River Lodge' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Stunning lodge overlooking the Zambezi River with private deck.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Livingstone' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Southern Province' })
  @IsString()
  province: string;

  @ApiProperty({ example: 'Plot 45, Riverfront Road' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: -17.8543 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 25.8567 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Price per unit in Ngwee (e.g. 450000 = ZMW 4,500.00)', example: 4500000 })
  @IsInt()
  @Min(0)
  pricePerUnitNgwee: number;

  @ApiProperty({ enum: ['ZMW', 'USD'], example: 'ZMW' })
  @IsIn(['ZMW', 'USD'])
  currency: 'ZMW' | 'USD';

  @ApiProperty({ type: [String], example: ['https://images.unsplash.com/...'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ type: [String], example: ['WiFi', 'Swimming Pool', 'Air conditioning'] })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({ type: [String], example: ['No smoking inside', 'Quiet hours after 22:00'] })
  @IsArray()
  @IsString({ each: true })
  houseRules: string[];

  @ApiProperty({ enum: ['flexible', 'moderate', 'strict'], example: 'moderate' })
  @IsIn(['flexible', 'moderate', 'strict'])
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';

  @ApiPropertyOptional({ type: StayDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StayDetailsDto)
  stayDetails?: StayDetailsDto;

  @ApiPropertyOptional({ type: ExperienceDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceDetailsDto)
  experienceDetails?: ExperienceDetailsDto;

  @ApiPropertyOptional({ type: TransportDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransportDetailsDto)
  transportDetails?: TransportDetailsDto;
}

export class CreateUnifiedListingResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ enum: ['stay', 'experience', 'transport'], example: 'stay' })
  vertical: 'stay' | 'experience' | 'transport';

  @ApiProperty({ example: 'Luxury Zambezi River Lodge' })
  title: string;

  @ApiProperty({ example: 'luxury-zambezi-river-lodge-a1b2c3d4' })
  slug: string;

  @ApiProperty({ enum: ['active', 'draft'], example: 'active' })
  status: 'active' | 'draft';

  @ApiProperty({ example: 4500000 })
  pricePerUnitNgwee: number;

  @ApiProperty({ example: 'ZMW' })
  currency: 'ZMW';

  @ApiProperty({ example: '2026-09-30T14:30:00.000Z' })
  createdAt: string;
}

export class UpdateListingStatusDto {
  @ApiProperty({
    enum: ['active', 'draft', 'paused', 'archived', 'inactive'],
    example: 'active',
  })
  @IsIn(['active', 'draft', 'paused', 'archived', 'inactive'])
  status: 'active' | 'draft' | 'paused' | 'archived' | 'inactive';
}

export class UpdateListingStatusResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ enum: ['active', 'draft', 'paused', 'archived', 'inactive'], example: 'active' })
  status: 'active' | 'draft' | 'paused' | 'archived' | 'inactive';

  @ApiProperty({ example: '2026-09-30T15:00:00.000Z' })
  updatedAt: string;
}

export class DeleteListingResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

export class AdjustInventoryDto {
  @ApiPropertyOptional({ description: 'New absolute inventory count (e.g. 14)', example: 14 })
  @IsOptional()
  @IsInt()
  @Min(0)
  inventoryCount?: number;

  @ApiPropertyOptional({ enum: ['increase', 'decrease', 'set'], example: 'decrease' })
  @IsOptional()
  @IsIn(['increase', 'decrease', 'set'])
  operation?: 'increase' | 'decrease' | 'set';

  @ApiPropertyOptional({ description: 'Amount to increase or decrease by', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;
}

export class AdjustInventoryResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'Mukuni Chalet' })
  propertyName: string;

  @ApiProperty({ description: 'Total active inventory units', example: 14 })
  inventoryCount: number;

  @ApiProperty({ description: 'Count of active room/unit entities', example: 14 })
  activeUnitsCount: number;

  @ApiProperty({ example: '2026-09-30T17:45:00.000Z' })
  updatedAt: string;
}
