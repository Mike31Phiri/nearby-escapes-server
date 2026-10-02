export declare class HostPayoutMethodDetailsDto {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branchCode?: string;
    swiftCode?: string;
    provider?: 'Airtel Money' | 'MTN Mobile Money';
    mobileNumber?: string;
}
export declare class HostPayoutMethodItemDto {
    id: string;
    type: 'bank_transfer' | 'mobile_money';
    isDefault: boolean;
    details: HostPayoutMethodDetailsDto;
}
export declare class HostFinancesSummaryDto {
    currency: 'ZMW';
    availableBalanceNgwee: number;
    pendingPayoutsNgwee: number;
    lifetimeEarningsNgwee: number;
    nextPayoutDate: string;
    payoutMethods: HostPayoutMethodItemDto[];
}
export declare class AddHostPayoutMethodDto {
    type: 'bank_transfer' | 'mobile_money';
    isDefault?: boolean;
    details?: HostPayoutMethodDetailsDto;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    provider?: 'Airtel Money' | 'MTN Mobile Money';
    mobileNumber?: string;
}
