import { Injectable } from '@nestjs/common';
import { PROPERTY_SYNC_QUEUE, PropertySyncJobData } from './property-sync.constants';

export { PROPERTY_SYNC_QUEUE } from './property-sync.constants';
export type { PropertySyncJobData } from './property-sync.constants';

@Injectable()
export class PropertySyncWorker {}
