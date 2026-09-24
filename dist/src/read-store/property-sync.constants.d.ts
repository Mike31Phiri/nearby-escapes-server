export declare const PROPERTY_SYNC_QUEUE = "property-sync";
export declare const LISTING_SYNC_QUEUE = "property-sync";
export interface PropertySyncJobData {
    propertyId: string;
    deleted?: boolean;
}
export type ListingSyncJobData = {
    listingId?: string;
    propertyId?: string;
    deleted?: boolean;
};
