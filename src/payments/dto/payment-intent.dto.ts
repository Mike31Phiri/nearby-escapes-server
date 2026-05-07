import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class PaymentIntentDto {
  @IsString()
  bookingId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'ZMW';
}
