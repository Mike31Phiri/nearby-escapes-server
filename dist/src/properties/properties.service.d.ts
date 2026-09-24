import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateStayDto, UpdateStayDto } from './dto/create-stay.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/create-experience.dto';
import { CreateTransportDto, UpdateTransportDto } from './dto/create-transport.dto';
export declare class PropertiesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private readonly fullInclude;
    createProperty(hostId: string, dto: CreatePropertyDto): Promise<{
        id: any;
        type: any;
        status: any;
        name: any;
        description: any;
        location: any;
        currency: any;
        price: number;
        priceFormatted: string;
        rating: number;
        reviewCount: any;
        thumbnailUrl: any;
        images: any;
        amenities: any;
        rules: any;
        hostId: any;
        hostName: any;
        hostAvatar: any;
        createdAt: any;
        updatedAt: any;
        stays: any;
        experiences: any;
        transports: any;
    }>;
    update(id: string, hostId: string, dto: UpdatePropertyDto): Promise<{
        id: any;
        type: any;
        status: any;
        name: any;
        description: any;
        location: any;
        currency: any;
        price: number;
        priceFormatted: string;
        rating: number;
        reviewCount: any;
        thumbnailUrl: any;
        images: any;
        amenities: any;
        rules: any;
        hostId: any;
        hostName: any;
        hostAvatar: any;
        createdAt: any;
        updatedAt: any;
        stays: any;
        experiences: any;
        transports: any;
    }>;
    remove(id: string, hostId: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    addStay(propertyId: string, hostId: string, dto: CreateStayDto): Promise<{
        propertyId: string;
        stay: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            propertyId: string;
            sortOrder: number;
            isActive: boolean;
            price: number;
            roomType: string | null;
            bedrooms: number | null;
            beds: number | null;
            baths: number | null;
            maxGuests: number | null;
            checkInFrom: string | null;
            checkInUntil: string | null;
            checkOutBefore: string | null;
            cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy | null;
        };
    }>;
    listStays(propertyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        propertyId: string;
        sortOrder: number;
        isActive: boolean;
        price: number;
        roomType: string | null;
        bedrooms: number | null;
        beds: number | null;
        baths: number | null;
        maxGuests: number | null;
        checkInFrom: string | null;
        checkInUntil: string | null;
        checkOutBefore: string | null;
        cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy | null;
    }[]>;
    updateStay(propertyId: string, stayId: string, hostId: string, dto: UpdateStayDto): Promise<{
        propertyId: string;
        stay: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            propertyId: string;
            sortOrder: number;
            isActive: boolean;
            price: number;
            roomType: string | null;
            bedrooms: number | null;
            beds: number | null;
            baths: number | null;
            maxGuests: number | null;
            checkInFrom: string | null;
            checkInUntil: string | null;
            checkOutBefore: string | null;
            cancellationPolicy: import("@prisma/client").$Enums.CancellationPolicy | null;
        };
    }>;
    removeStay(propertyId: string, stayId: string, hostId: string): Promise<{
        propertyId: string;
        stayId: string;
        deleted: boolean;
    }>;
    addExperience(propertyId: string, hostId: string, dto: CreateExperienceDto): Promise<{
        propertyId: string;
        experience: {
            timeSlots: {
                id: string;
                experienceId: string;
                slot: string;
            }[];
            inclusions: {
                id: string;
                experienceId: string;
                item: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            propertyId: string;
            sortOrder: number;
            isActive: boolean;
            price: number;
            activityType: string | null;
            duration: string | null;
            maxParticipants: number | null;
            difficultyLevel: string | null;
            meetingPoint: string | null;
        };
    }>;
    listExperiences(propertyId: string): Promise<({
        timeSlots: {
            id: string;
            experienceId: string;
            slot: string;
        }[];
        inclusions: {
            id: string;
            experienceId: string;
            item: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        propertyId: string;
        sortOrder: number;
        isActive: boolean;
        price: number;
        activityType: string | null;
        duration: string | null;
        maxParticipants: number | null;
        difficultyLevel: string | null;
        meetingPoint: string | null;
    })[]>;
    updateExperience(propertyId: string, experienceId: string, hostId: string, dto: UpdateExperienceDto): Promise<{
        propertyId: string;
        experience: {
            timeSlots: {
                id: string;
                experienceId: string;
                slot: string;
            }[];
            inclusions: {
                id: string;
                experienceId: string;
                item: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            propertyId: string;
            sortOrder: number;
            isActive: boolean;
            price: number;
            activityType: string | null;
            duration: string | null;
            maxParticipants: number | null;
            difficultyLevel: string | null;
            meetingPoint: string | null;
        };
    }>;
    removeExperience(propertyId: string, experienceId: string, hostId: string): Promise<{
        propertyId: string;
        experienceId: string;
        deleted: boolean;
    }>;
    addTransport(propertyId: string, hostId: string, dto: CreateTransportDto): Promise<{
        propertyId: string;
        transport: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            propertyId: string;
            from: string | null;
            to: string | null;
            sortOrder: number;
            isActive: boolean;
            vehicleType: string | null;
            capacity: number | null;
            pricePerSeat: number | null;
            schedule: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    listTransports(propertyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        propertyId: string;
        from: string | null;
        to: string | null;
        sortOrder: number;
        isActive: boolean;
        vehicleType: string | null;
        capacity: number | null;
        pricePerSeat: number | null;
        schedule: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    updateTransport(propertyId: string, transportId: string, hostId: string, dto: UpdateTransportDto): Promise<{
        propertyId: string;
        transport: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            propertyId: string;
            from: string | null;
            to: string | null;
            sortOrder: number;
            isActive: boolean;
            vehicleType: string | null;
            capacity: number | null;
            pricePerSeat: number | null;
            schedule: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    removeTransport(propertyId: string, transportId: string, hostId: string): Promise<{
        propertyId: string;
        transportId: string;
        deleted: boolean;
    }>;
    addImages(id: string, hostId: string, imageUrls: string[]): Promise<{
        id: string;
        images: {
            url: string;
            sortOrder: number;
        }[];
    }>;
    removeImage(id: string, hostId: string, imageUrl: string): Promise<{
        id: string;
        images: {
            url: string;
            sortOrder: number;
        }[];
    }>;
    addAmenity(id: string, hostId: string, name: string, icon?: string): Promise<{
        id: string;
        amenity: {
            id: string;
            name: string;
            propertyId: string;
            icon: string | null;
        };
    }>;
    removeAmenity(id: string, hostId: string, amenityId: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    addRule(id: string, hostId: string, rule: string): Promise<{
        id: string;
        rule: {
            id: string;
            propertyId: string;
            rule: string;
        };
    }>;
    removeRule(id: string, hostId: string, ruleId: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    findByHost(hostId: string): Promise<{
        id: any;
        type: any;
        status: any;
        name: any;
        description: any;
        location: any;
        currency: any;
        price: number;
        priceFormatted: string;
        rating: number;
        reviewCount: any;
        thumbnailUrl: any;
        images: any;
        amenities: any;
        rules: any;
        hostId: any;
        hostName: any;
        hostAvatar: any;
        createdAt: any;
        updatedAt: any;
        stays: any;
        experiences: any;
        transports: any;
    }[]>;
    findOneFromDb(id: string): Promise<{
        id: any;
        type: any;
        status: any;
        name: any;
        description: any;
        location: any;
        currency: any;
        price: number;
        priceFormatted: string;
        rating: number;
        reviewCount: any;
        thumbnailUrl: any;
        images: any;
        amenities: any;
        rules: any;
        hostId: any;
        hostName: any;
        hostAvatar: any;
        createdAt: any;
        updatedAt: any;
        stays: any;
        experiences: any;
        transports: any;
    }>;
    formatProperty(property: any): {
        id: any;
        type: any;
        status: any;
        name: any;
        description: any;
        location: any;
        currency: any;
        price: number;
        priceFormatted: string;
        rating: number;
        reviewCount: any;
        thumbnailUrl: any;
        images: any;
        amenities: any;
        rules: any;
        hostId: any;
        hostName: any;
        hostAvatar: any;
        createdAt: any;
        updatedAt: any;
        stays: any;
        experiences: any;
        transports: any;
    };
    private assertOwnership;
}
export declare const ListingsService: typeof PropertiesService;
