import { IsString, IsArray, IsOptional } from 'class-validator';

export class AddImagesDto {
  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class RemoveImageDto {
  @IsString()
  imageUrl: string;
}

export class AddAmenityDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class AddRuleDto {
  @IsString()
  rule: string;
}
