import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardHostDto {
  @ApiProperty({ example: 'South Luangwa Safari Lodge Ltd' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiPropertyOptional({ example: '2019' })
  @IsOptional()
  @IsString()
  operatingSince?: string;

  @ApiPropertyOptional({ example: 'Eastern' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Mfuwe' })
  @IsOptional()
  @IsString()
  town?: string;

  @ApiPropertyOptional({ example: 'reservations@southluangwa.co.zm' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiPropertyOptional({ example: '+260977654321' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiPropertyOptional({ example: [{ id: 'doc_1', name: 'pacra.pdf', url: 'https://...', size: 1024 }] })
  @IsOptional()
  @IsArray()
  pacraDocs?: any[];

  @ApiPropertyOptional({ example: [{ id: 'doc_2', name: 'title.pdf', url: 'https://...', size: 2048 }] })
  @IsOptional()
  @IsArray()
  ownershipDocs?: any[];

  @ApiPropertyOptional({ example: [{ id: 'doc_3', name: 'permit.pdf', url: 'https://...', size: 512 }] })
  @IsOptional()
  @IsArray()
  operationDocs?: any[];
}
