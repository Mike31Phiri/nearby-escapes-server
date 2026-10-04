import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
  @ApiProperty({ example: 'guest@example.com', description: 'The registered guest email address' })
  @IsEmail()
  email: string;
}
