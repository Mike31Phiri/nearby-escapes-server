import { IsString, IsNumber, IsPositive, Min, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CancellationPolicy } from '@prisma/client';

export class UpdateBusDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() route?: string;
  @IsOptional() @IsDateString() departureTime?: string;
  @IsOptional() @IsDateString() arrivalTime?: string;
  @IsOptional() @IsNumber() @IsPositive() pricePerSeat?: number;
  @IsOptional() @IsNumber() @Min(1) totalSeats?: number;
  @IsOptional() @IsNumber() @Min(0) availableSeats?: number;
  @ApiPropertyOptional({ enum: CancellationPolicy })
  @IsOptional() @IsEnum(CancellationPolicy) cancellationPolicy?: CancellationPolicy;
}
