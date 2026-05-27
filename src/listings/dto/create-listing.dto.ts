import { IsString, IsOptional, IsArray, IsInt, Min, IsEnum, IsNumber, IsPositive, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CancellationPolicy } from '@prisma/client';

// ─── Common listing search params ────────────────────────────────────────────

export class ListingsQueryDto {
  @IsOptional()
  @IsString()
  type?: string; // stay | experience | transport | all

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string; // price_asc | price_desc | rating | newest

  @IsOptional()
  @IsString()
  featured?: string; // gem

  @IsOptional()
  @IsString()
  minDuration?: string; // e.g. "3d"
}

// ─── Create Stay ─────────────────────────────────────────────────────────────

export class CreateStayDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  propertyType: string;

  @IsInt()
  @Min(0)
  bedrooms: number;

  @IsInt()
  @Min(0)
  beds: number;

  @IsInt()
  @Min(0)
  baths: number;

  @IsInt()
  @Min(1)
  maxGuests: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsInt()
  @Min(0)
  pricePerNight: number;

  @IsOptional()
  @IsString()
  checkInFrom?: string;

  @IsOptional()
  @IsString()
  checkInUntil?: string;

  @IsOptional()
  @IsString()
  checkOutBefore?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  houseRules?: string[];

  @IsOptional()
  @IsEnum(CancellationPolicy)
  cancellationPolicy?: CancellationPolicy;
}

// ─── Create Experience ───────────────────────────────────────────────────────

export class CreateExperienceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  activityType: string;

  @IsString()
  duration: string;

  @IsInt()
  @Min(1)
  maxParticipants: number;

  @IsOptional()
  @IsString()
  @IsIn(['easy', 'moderate', 'challenging'])
  difficultyLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatsIncluded?: string[];

  @IsString()
  meetingPoint: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timeSlots?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsInt()
  @Min(0)
  pricePerPerson: number;

  @IsString()
  location: string;
}

// ─── Create Transport ────────────────────────────────────────────────────────

export class CreateTransportDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  vehicleType: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  @Min(0)
  pricePerSeat: number;

  @IsOptional()
  schedule?: { frequency: string; departureTimes: string[] };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

// ─── Update Listing ──────────────────────────────────────────────────────────

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

// ─── Image operations ────────────────────────────────────────────────────────

export class AddImagesDto {
  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class RemoveImageDto {
  @IsString()
  imageUrl: string;
}

// ─── Curated listings ────────────────────────────────────────────────────────

export class CuratedQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['packages', 'gems'])
  type?: string;
}
