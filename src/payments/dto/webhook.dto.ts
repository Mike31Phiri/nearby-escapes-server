import { IsString } from 'class-validator';

export class WebhookDto {
  @IsString()
  providerRef: string;

  @IsString()
  status: string; // 'success' | 'failed'
}
