import { UploadsService } from './uploads.service';
import type { Request } from 'express';
export declare class UploadsController {
    private uploadsService;
    constructor(uploadsService: UploadsService);
    upload(req: Request, files: Express.MulterS3.File[], resourceType: 'accommodation' | 'bus' | 'attraction' | 'package', resourceId: string): Promise<{
        uploaded: any[];
    }>;
    deletePhoto(key: string): Promise<{
        deleted: string;
    }>;
}
