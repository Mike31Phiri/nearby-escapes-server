import { IsString, IsNumber, IsPositive, IsNotEmpty, IsOptional } from 'class-validator';

export class InitiateDpoPaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'ZMW';
}