import { IsString, IsNumber, IsPositive, Min, IsDateString } from 'class-validator';

export class CreateBusDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  route: string;

  @IsDateString()
  departureTime: string;

  @IsDateString()
  arrivalTime: string;

  @IsNumber()
  @IsPositive()
  pricePerSeat: number;

  @IsNumber()
  @Min(1)
  totalSeats: number;
}
