import { UploadsService } from './uploads.service';
import type { Request } from 'express';
export declare class UploadsController {
    private uploadsService;
    constructor(uploadsService: UploadsService);
    upload(req: Request, files: Express.MulterS3.File[], propertyId?: string, listingId?: string): Promise<{
        key: any;
        url: any;
        uploaded: {
            key: any;
            url: any;
        }[];
    }>;
    deletePhoto(key: string): Promise<{
        deleted: string;
    }>;
}
