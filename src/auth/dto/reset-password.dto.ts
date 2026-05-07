import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'uuid-reset-token' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
