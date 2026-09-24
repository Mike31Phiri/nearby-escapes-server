import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsOptional()
  @IsString()
  bookingRef?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  text?: string;
}
