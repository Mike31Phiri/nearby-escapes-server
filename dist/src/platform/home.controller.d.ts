import { ReadStoreService } from '../read-store/read-store.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class HomeController {
    private readonly readStore;
    private readonly prisma;
    constructor(readStore: ReadStoreService, prisma: PrismaService);
    getHomeFeed(limitQuery?: number): Promise<{
        stays: {
            popular: import("../read-store/types/property-document.type").ReadPropertyDocument[];
            recommended: import("../read-store/types/property-document.type").ReadPropertyDocument[];
        };
        experiences: {
            popular: import("../read-store/types/property-document.type").ReadPropertyDocument[];
            recommended: import("../read-store/types/property-document.type").ReadPropertyDocument[];
        };
        transports: {
            popular: import("../read-store/types/property-document.type").ReadPropertyDocument[];
        };
        packages: {
            popular: import("../read-store/types/property-document.type").ReadPropertyDocument[];
        };
        destinations: {
            listingCount: number;
            id: string;
            name: string;
            province: string;
            tagline: string;
            description: string;
            image: string;
        }[];
    }>;
    getDestinations(): Promise<{
        listingCount: number;
        id: string;
        name: string;
        province: string;
        tagline: string;
        description: string;
        image: string;
    }[]>;
}
