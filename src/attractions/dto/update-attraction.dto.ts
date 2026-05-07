import { IsString, IsNumber, IsPositive, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CancellationPolicy } from '@prisma/client';

export class UpdateAttractionDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsNumber() @IsPositive() pricePerPerson?: number;
  @IsOptional() @IsNumber() @Min(1) capacity?: number;
  @IsOptional() @IsNumber() @Min(0) availableSlots?: number;
  @ApiPropertyOptional({ enum: CancellationPolicy })
  @IsOptional() @IsEnum(CancellationPolicy) cancellationPolicy?: CancellationPolicy;
}
