import { PopularityService } from './popularity.service';
export declare class PopularityController {
    private readonly popularityService;
    constructor(popularityService: PopularityService);
    getPopularStays(): Promise<any[]>;
    getPopularExperiences(): Promise<any[]>;
    getMetadata(): Promise<any>;
    recalculate(): Promise<{
        stays: number;
        experiences: number;
        timestamp: string;
    }>;
}
