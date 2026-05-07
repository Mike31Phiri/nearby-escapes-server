import { IsString } from 'class-validator';

export class CreateHostDto {
  @IsString()
  businessName: string;
}
