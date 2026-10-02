import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HostPayoutMethodDetailsDto {
  @ApiPropertyOptional({ example: 'Absa Bank Zambia' })
  bankName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'John Banda' })
  accountName?: string;

  @ApiPropertyOptional({ example: '001' })
  branchCode?: string;

  @ApiPropertyOptional({ example: 'ABSAZMLX' })
  swiftCode?: string;

  @ApiPropertyOptional({ enum: ['Airtel Money', 'MTN Mobile Money'], example: 'Airtel Money' })
  provider?: 'Airtel Money' | 'MTN Mobile Money';

  @ApiPropertyOptional({ example: '+260971234567' })
  mobileNumber?: string;
}

export class HostPayoutMethodItemDto {
  @ApiProperty({ example: 'pm-1' })
  id: string;

  @ApiProperty({ enum: ['bank_transfer', 'mobile_money'], example: 'bank_transfer' })
  type: 'bank_transfer' | 'mobile_money';

  @ApiProperty({ example: true })
  isDefault: boolean;

  @ApiProperty({ type: HostPayoutMethodDetailsDto })
  details: HostPayoutMethodDetailsDto;
}

export class HostFinancesSummaryDto {
  @ApiProperty({ example: 'ZMW' })
  currency: 'ZMW';

  @ApiProperty({ description: 'Available balance ready for payout (in Ngwee)', example: 3840000 })
  availableBalanceNgwee: number;

  @ApiProperty({ description: 'Pending payouts in progress (in Ngwee)', example: 1200000 })
  pendingPayoutsNgwee: number;

  @ApiProperty({ description: 'Lifetime gross/net earnings (in Ngwee)', example: 18450000 })
  lifetimeEarningsNgwee: number;

  @ApiProperty({ description: 'Next scheduled settlement date (YYYY-MM-DD)', example: '2026-10-02' })
  nextPayoutDate: string;

  @ApiProperty({ type: [HostPayoutMethodItemDto] })
  payoutMethods: HostPayoutMethodItemDto[];
}

export class AddHostPayoutMethodDto {
  @ApiProperty({ enum: ['bank_transfer', 'mobile_money'], example: 'mobile_money' })
  type: 'bank_transfer' | 'mobile_money';

  @ApiPropertyOptional({ example: true })
  isDefault?: boolean;

  @ApiPropertyOptional({ type: HostPayoutMethodDetailsDto })
  details?: HostPayoutMethodDetailsDto;

  @ApiPropertyOptional({ example: 'Absa Bank Zambia' })
  bankName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'Mwamba Chali' })
  accountName?: string;

  @ApiPropertyOptional({ example: 'Airtel Money' })
  provider?: 'Airtel Money' | 'MTN Mobile Money';

  @ApiPropertyOptional({ example: '+260971234567' })
  mobileNumber?: string;
}
