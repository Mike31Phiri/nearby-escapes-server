import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum TicketTopic {
  PAYOUT = 'payout',
  CALENDAR = 'calendar',
  GUEST = 'guest',
  VERIFICATION = 'verification',
  OTHER = 'other',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

export class CreateHostSupportTicketDto {
  @IsEnum(TicketTopic, {
    message: 'topic must be one of: payout, calendar, guest, verification, other',
  })
  @IsNotEmpty()
  topic: TicketTopic;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(120)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  bookingRef?: string;

  @IsOptional()
  @IsString()
  listingId?: string;
}
