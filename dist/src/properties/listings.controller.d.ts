import { PropertiesService } from './properties.service';
import { ReadStoreService } from '../read-store/read-store.service';
import { HostsService } from '../hosts/hosts.service';
import { CreateUnifiedListingDto, CreateUnifiedListingResponseDto, UpdateListingStatusDto, UpdateListingStatusResponseDto, DeleteListingResponseDto, AdjustInventoryDto, AdjustInventoryResponseDto } from './dto/create-listing-unified.dto';
import { UpdatePropertyPricingDto, UpdatePropertyPricingResponseDto } from './dto/update-property.dto';
import { PropertiesQueryDto } from './dto/properties-query.dto';
import type { User } from '@prisma/client';
export declare class ListingsController {
    private readonly propertiesService;
    private readonly readStore;
    private readonly hostsService;
    constructor(propertiesService: PropertiesService, readStore: ReadStoreService, hostsService: HostsService);
    createUnified(user: User, dto: CreateUnifiedListingDto): Promise<CreateUnifiedListingResponseDto>;
    updateStatus(user: User, id: string, dto: UpdateListingStatusDto): Promise<UpdateListingStatusResponseDto>;
    adjustInventory(user: User, id: string, dto: AdjustInventoryDto): Promise<AdjustInventoryResponseDto>;
    updatePricing(user: User, id: string, dto: UpdatePropertyPricingDto): Promise<UpdatePropertyPricingResponseDto>;
    deleteListing(user: User, id: string): Promise<DeleteListingResponseDto>;
    findAll(query: PropertiesQueryDto): Promise<{
        data: import("../read-store/types/property-document.type").ReadPropertyDocument[];
        meta: any;
    }>;
    findOne(id: string): Promise<import("../read-store/types/property-document.type").ReadPropertyDocument>;
    getListingPolicies(id: string): Promise<{
        propertyId: string;
        title: string;
        cancellation: {
            tier: import("../policies/dto/policy.dto").CancellationTier;
            headline: string;
            description: any;
            freeCancellationDeadline: string;
        };
        checkInWindow: string;
        checkOutBefore: any;
        houseRulesSummary: string[];
        securityDepositNote: string;
        goodToKnow: any;
        success: boolean;
        data: {
            propertyId: string;
            title: string;
            cancellation: {
                tier: import("../policies/dto/policy.dto").CancellationTier;
                headline: string;
                description: any;
                freeCancellationDeadline: string;
            };
            checkInWindow: string;
            checkOutBefore: any;
            houseRulesSummary: string[];
            securityDepositNote: string;
            goodToKnow: any;
        };
    }>;
}
