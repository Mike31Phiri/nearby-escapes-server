import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  stayIds?: string[];

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
