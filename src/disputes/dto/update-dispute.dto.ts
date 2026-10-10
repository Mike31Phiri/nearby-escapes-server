import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DisputeStatus } from '@prisma/client';

export class UpdateDisputeDto {
  @ApiProperty({
    description: 'New status for the dispute',
    enum: DisputeStatus,
    example: DisputeStatus.INVESTIGATING,
  })
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Admin resolution notes explaining the outcome',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  resolution?: string;
}
