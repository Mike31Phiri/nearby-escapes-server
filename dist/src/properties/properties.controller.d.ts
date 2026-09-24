import { PropertiesService } from './properties.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateStayDto, UpdateStayDto } from './dto/create-stay.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/create-experience.dto';
import { CreateTransportDto, UpdateTransportDto } from './dto/create-transport.dto';
import { PropertiesQueryDto } from './dto/properties-query.dto';
import { AddImagesDto, RemoveImageDto, AddAmenityDto, AddRuleDto } from './dto/property-extras.dto';
import { HostsService } from '../hosts/hosts.service';
import type { User } from '@prisma/client';
export declare class PropertiesController {
    private readonly propertiesService;
    private readonly readStore;
    private readonly hostsService;
    constructor(propertiesService: PropertiesService, readStore: ReadStoreService, hostsService: HostsService);
    findAll(query: PropertiesQueryDto): Promise<{
        data: import("../read-store/types/property-document.type").ReadPropertyDocument[];
        meta: any;
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
    findOne(id: string): Promise<import("../read-store/types/property-document.type").ReadPropertyDocument>;
    create(user: User, dto: CreatePropertyDto): Promise<{
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
    update(user: User, id: string, dto: UpdatePropertyDto): Promise<{
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
    remove(user: User, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listStays(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        propertyId: string;
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
    addStay(user: User, id: string, dto: CreateStayDto): Promise<{
        propertyId: string;
        stay: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            propertyId: string;
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
    updateStay(user: User, id: string, stayId: string, dto: UpdateStayDto): Promise<{
        propertyId: string;
        stay: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            propertyId: string;
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
    removeStay(user: User, id: string, stayId: string): Promise<{
        propertyId: string;
        stayId: string;
        deleted: boolean;
    }>;
    listExperiences(id: string): Promise<({
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
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        propertyId: string;
        isActive: boolean;
        price: number;
        activityType: string | null;
        duration: string | null;
        maxParticipants: number | null;
        difficultyLevel: string | null;
        meetingPoint: string | null;
    })[]>;
    addExperience(user: User, id: string, dto: CreateExperienceDto): Promise<{
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
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            propertyId: string;
            isActive: boolean;
            price: number;
            activityType: string | null;
            duration: string | null;
            maxParticipants: number | null;
            difficultyLevel: string | null;
            meetingPoint: string | null;
        };
    }>;
    updateExperience(user: User, id: string, experienceId: string, dto: UpdateExperienceDto): Promise<{
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
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            propertyId: string;
            isActive: boolean;
            price: number;
            activityType: string | null;
            duration: string | null;
            maxParticipants: number | null;
            difficultyLevel: string | null;
            meetingPoint: string | null;
        };
    }>;
    removeExperience(user: User, id: string, experienceId: string): Promise<{
        propertyId: string;
        experienceId: string;
        deleted: boolean;
    }>;
    listTransports(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        propertyId: string;
        isActive: boolean;
        from: string | null;
        to: string | null;
        vehicleType: string | null;
        capacity: number | null;
        pricePerSeat: number | null;
        schedule: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    addTransport(user: User, id: string, dto: CreateTransportDto): Promise<{
        propertyId: string;
        transport: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            propertyId: string;
            isActive: boolean;
            from: string | null;
            to: string | null;
            vehicleType: string | null;
            capacity: number | null;
            pricePerSeat: number | null;
            schedule: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    updateTransport(user: User, id: string, transportId: string, dto: UpdateTransportDto): Promise<{
        propertyId: string;
        transport: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            propertyId: string;
            isActive: boolean;
            from: string | null;
            to: string | null;
            vehicleType: string | null;
            capacity: number | null;
            pricePerSeat: number | null;
            schedule: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    removeTransport(user: User, id: string, transportId: string): Promise<{
        propertyId: string;
        transportId: string;
        deleted: boolean;
    }>;
    addImages(user: User, id: string, dto: AddImagesDto): Promise<{
        id: string;
        images: {
            url: string;
            sortOrder: number;
        }[];
    }>;
    removeImage(user: User, id: string, dto: RemoveImageDto): Promise<{
        id: string;
        images: {
            url: string;
            sortOrder: number;
        }[];
    }>;
    addAmenity(user: User, id: string, dto: AddAmenityDto): Promise<{
        id: string;
        amenity: {
            name: string;
            id: string;
            propertyId: string;
            icon: string | null;
        };
    }>;
    removeAmenity(user: User, id: string, amenityId: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    addRule(user: User, id: string, dto: AddRuleDto): Promise<{
        id: string;
        rule: {
            id: string;
            propertyId: string;
            rule: string;
        };
    }>;
    removeRule(user: User, id: string, ruleId: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
