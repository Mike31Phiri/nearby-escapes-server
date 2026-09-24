import { IsString, IsOptional, IsInt, Min, IsArray, IsBoolean } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price: number; // in Ngwee per person

  @IsOptional()
  @IsString()
  activityType?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timeSlots?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  activityType?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timeSlots?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
