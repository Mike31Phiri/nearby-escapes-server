import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({
    description: 'ID of the booking to dispute (must be a recent booking belonging to the caller)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: 'Short one-line reason / complaint category',
    example: 'Property not as described',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason: string;

  @ApiPropertyOptional({
    description: 'Full complaint message providing detail about the issue',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}
