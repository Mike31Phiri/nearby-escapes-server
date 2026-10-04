import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'guest@example.com', description: 'The registered guest email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit verification code sent via email' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  code: string;
}
