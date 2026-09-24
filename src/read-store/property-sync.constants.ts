/** Shared queue token — imported by both the worker and the read-store service
 *  to break the circular dependency between those two files. */
export const PROPERTY_SYNC_QUEUE = 'property-sync';
export const LISTING_SYNC_QUEUE = PROPERTY_SYNC_QUEUE;

export interface PropertySyncJobData {
  propertyId: string;
  deleted?: boolean;
}

export type ListingSyncJobData = {
  listingId?: string;
  propertyId?: string;
  deleted?: boolean;
};
