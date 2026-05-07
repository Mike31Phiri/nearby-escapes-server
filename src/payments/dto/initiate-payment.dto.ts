import { IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  bookingId: string;

  @IsString()
  provider: string; // e.g. 'mtn', 'airtel', 'zamtel', 'visa'
}
