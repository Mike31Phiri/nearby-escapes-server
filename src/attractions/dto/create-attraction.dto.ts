import { IsString, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateAttractionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsNumber()
  @IsPositive()
  pricePerPerson: number;

  @IsNumber()
  @Min(1)
  capacity: number;
}
