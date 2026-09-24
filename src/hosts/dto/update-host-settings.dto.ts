import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateHostSettingsDto {
  @ApiPropertyOptional({
    description: 'Usual / default check-in time (e.g. 14:00)',
    example: '14:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'defaultCheckInTime must be in HH:MM 24-hour format (e.g. 14:00)',
  })
  defaultCheckInTime?: string;

  @ApiPropertyOptional({
    description: 'Usual / default check-out time (e.g. 10:00)',
    example: '10:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'defaultCheckOutTime must be in HH:MM 24-hour format (e.g. 10:00)',
  })
  defaultCheckOutTime?: string;

  @ApiPropertyOptional({
    description: 'Host business or trading name',
    example: 'Zambezi Sun Lodges',
  })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({
    description: 'Preferred payout method (BANK_TRANSFER or MOBILE_MONEY)',
    example: 'BANK_TRANSFER',
  })
  @IsOptional()
  @IsString()
  payoutMethod?: string;

  @ApiPropertyOptional({
    description: 'Payout account details (bank account or mobile money phone number)',
    example: '+260971234567',
  })
  @IsOptional()
  @IsString()
  payoutAccount?: string;
}
