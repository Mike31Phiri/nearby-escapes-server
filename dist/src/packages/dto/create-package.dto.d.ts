import { PackageItemDto } from './package-item.dto';
export declare class CreatePackageDto {
    name: string;
    description: string;
    totalPrice: number;
    items: PackageItemDto[];
}
