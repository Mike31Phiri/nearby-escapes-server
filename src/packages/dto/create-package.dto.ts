import { IsArray, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageItemDto } from './package-item.dto';

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  totalPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageItemDto)
  items: PackageItemDto[];
}
