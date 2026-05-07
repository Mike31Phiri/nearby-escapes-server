import { PackageItemDto } from './package-item.dto';
export declare class UpdatePackageDto {
    name?: string;
    description?: string;
    totalPrice?: number;
    items?: PackageItemDto[];
}
